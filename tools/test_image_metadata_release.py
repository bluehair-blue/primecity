from __future__ import annotations

import gzip
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from tools import image_metadata_release as release


def embed_stealth(image: Image.Image, payload: bytes) -> None:
    bits = b"stealth_pngcomp" + (len(payload) * 8).to_bytes(4, "big") + payload
    bit_string = "".join(f"{byte:08b}" for byte in bits)
    if len(bit_string) > image.width * image.height:
        raise ValueError("test image is too small")
    pixels = image.load()
    for index, bit in enumerate(bit_string):
        x, y = divmod(index, image.height)
        red, green, blue, alpha = pixels[x, y]
        pixels[x, y] = (red, green, blue, (alpha & 0xFE) | int(bit))


class ImageMetadataReleaseTest(unittest.TestCase):
    def test_release_defaults_use_a_fresh_timestamped_workspace(self) -> None:
        args = release.build_parser().parse_args(["release"])
        self.assertRegex(Path(args.backup).name, r"^char_img_bak_\d{8}_\d{6}_metadata$")
        self.assertRegex(Path(args.stage).name, r"^char_img_release_staging_\d{8}_\d{6}$")

    def release_one(self, source: Path, relative: str) -> tuple[Path, Path, dict]:
        staged = source.parent / "staged.webp"
        sidecar = source.parent / "sidecar.json"
        release.release_file((
            str(source),
            str(source.parent / "canonical.webp"),
            str(staged),
            str(sidecar),
            relative,
            release.BLUR_RADIUS,
        ))
        return staged, sidecar, json.loads(sidecar.read_text(encoding="utf-8"))

    def test_stealth_and_exif_are_preserved_in_sidecar_then_removed(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "source.webp"
            metadata = {"prompt": "secret prompt", "seed": 1234}
            payload = gzip.compress(json.dumps(metadata).encode("utf-8"))
            image = Image.new("RGBA", (64, 64), (80, 120, 160, 255))
            embed_stealth(image, payload)
            image.save(source, "WEBP", lossless=True, exact=True, exif=b'{"Comment":"secret"}')

            staged, _, sidecar = self.release_one(source, "T/1.webp")
            source_audit = sidecar["source"]
            self.assertEqual(source_audit["stealth_payloads"][0]["parsed_json"], metadata)
            self.assertIn("EXIF", [chunk["fourcc"] for chunk in source_audit["riff_chunks"]])

            output = release.audit_bytes(staged.read_bytes())
            self.assertEqual(output["stealth"], [])
            self.assertEqual(
                [chunk["fourcc"] for chunk in output["riff_chunks"] if chunk["fourcc"] in {"EXIF", "ICCP"}],
                [],
            )
            self.assertEqual(
                [chunk["fourcc"] for chunk in output["riff_chunks"]].count("XMP "),
                1,
            )

    def test_meaningful_transparency_is_preserved(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / "source.webp"
            image = Image.new("RGBA", (48, 48), (255, 0, 0, 0))
            for x in range(12, 36):
                for y in range(12, 36):
                    image.putpixel((x, y), (10, 120, 240, 255 if x < 30 else 128))
            image.save(source, "WEBP", lossless=True, exact=True)

            staged, _, _ = self.release_one(source, "T/key.webp")
            output = release.audit_bytes(staged.read_bytes())
            self.assertTrue(output["meaningful_alpha"])
            self.assertEqual(output["alpha_extrema"][0], [0, 254])

    def test_corrupt_stealth_payload_is_preserved_raw_and_scrubbed(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / "source.webp"
            payload = b"not-a-valid-gzip-stream"
            image = Image.new("RGBA", (64, 64), (40, 60, 80, 255))
            embed_stealth(image, payload)
            image.save(source, "WEBP", lossless=True, exact=True)

            staged, _, sidecar = self.release_one(source, "T/corrupt.webp")
            preserved = sidecar["source"]["stealth_payloads"][0]
            self.assertEqual(preserved["decode_status"], "error")
            self.assertEqual(preserved["payload_sha256"], release.digest(payload))
            self.assertEqual(release.audit_bytes(staged.read_bytes())["stealth"], [])

    def test_animation_frames_and_timing_are_preserved(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / "source.webp"
            frames = [
                Image.new("RGBA", (40, 32), (255, 0, 0, 255)),
                Image.new("RGBA", (40, 32), (0, 255, 0, 128)),
                Image.new("RGBA", (40, 32), (0, 0, 255, 0)),
            ]
            frames[0].save(
                source,
                "WEBP",
                save_all=True,
                append_images=frames[1:],
                duration=[70, 60, 70],
                loop=0,
                lossless=True,
                exact=True,
            )

            staged, _, _ = self.release_one(source, "T/animated.webp")
            output = release.audit_bytes(staged.read_bytes())
            self.assertEqual(output["frames"], 3)
            self.assertEqual(output["durations_ms"], [70, 60, 70])
            self.assertEqual(output["loop"], 0)


if __name__ == "__main__":
    unittest.main()
