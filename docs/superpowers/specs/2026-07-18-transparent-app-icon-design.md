# Transparent App Icon Design

## Goal

Remove the visible white corners from the packaged application icon and give all supported platforms the same deliberate, moderately rounded silhouette.

## Source artwork

Use `assets/icons/icon.png` as the artwork source. Preserve its wallet, graph, colors, lighting, composition, and 1024×1024 canvas. The silhouette may trim artwork at the extreme corners because the existing shape does not need to remain pixel-identical.

## Mask

Apply a centered rounded-rectangle alpha mask to the full canvas. Use a 184-pixel corner radius at 1024×1024. Pixels inside the mask remain unchanged. Pixels outside it become fully transparent. Antialias the mask edge so the rounded boundary remains smooth at smaller icon sizes.

## Generated assets

Regenerate every platform icon from the masked source:

- `assets/icons/icon.png`: 1024×1024 RGBA PNG.
- `assets/icons/icon.icns`: macOS icon containing the standard required representations.
- `assets/icons/icon.ico`: Windows icon containing multiple sizes through 256×256.

The Forge configuration and filenames remain unchanged.

## Verification

- Confirm the PNG has an alpha channel and all four corner pixels are transparent.
- Inspect the PNG on a contrasting background for a smooth edge and no white fringe.
- Confirm ICNS and ICO files contain their expected size representations.
- Render or extract representative small sizes from both generated containers and check that the silhouette remains recognizable.
- Run the existing lint command because no automated asset tests are configured.

## Scope

This change only replaces the three icon assets. It does not redesign the wallet artwork or change application code, packaging paths, names, or identifiers.
