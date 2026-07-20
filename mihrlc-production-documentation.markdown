---
layout: default
title: Michigan High Resolution Land Cover Production Documentation
permalink: /mihrlc-production-documentation/
excerpt: Production notes for the Michigan High Resolution Land Cover product, including the CNN model lineage, county fine-tuning workflow, product specifications, and references.
---

<style>
  #content table {
    border-collapse: collapse;
    display: block;
    margin: 1rem 0;
    max-width: 100%;
    overflow-x: auto;
    width: max-content;
  }

  #content th,
  #content td {
    border: 1px dotted #00FF00;
    padding: 0.45rem 0.55rem;
    text-align: left;
    vertical-align: top;
  }

  #content th {
    background-color: #252504;
  }

  .mihrlc-note {
    background-color: #252504;
    border: 2px dotted #00FF00;
    margin: 1rem 0;
    padding: 0.85rem;
  }

  .mihrlc-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0 1.5rem;
  }

  .mihrlc-actions a {
    border: 2px outset #00FF00;
    padding: 0.4rem 0.6rem;
  }
</style>

# Michigan High Resolution Land Cover Production Documentation

The Michigan High Resolution Land Cover product, abbreviated here as MiHRLC, is a county-organized 0.6 meter land-cover map for Michigan derived primarily from 2022 four-band NAIP imagery. The production workflow adapted Esri's pretrained **High Resolution Land Cover Classification - USA** model, then fine-tuned that CNN workflow for Michigan landscapes before exporting the final county GeoTIFF products. [1]

![Michigan High Resolution Land Cover statewide mosaic and MSU-area detail](/assets/images/projects/mihrlc_presentation_preview_statewide_msu.png?v=bca9d65)

<div class="mihrlc-actions">
  <a href="/assets/maps/mihrlc-pilot-map.html">Open the interactive pilot map</a>
  <a href="/projects.html">Back to projects</a>
</div>

<div class="mihrlc-note">
  This page is a production-methods note, not a formal statewide accuracy assessment. It describes the recovered workflow, model lineage, fine-tuning counties, technical parameters, and known limitations from the MiHRLC production archive.
</div>

## Product Summary

| Item | Production value |
|---|---|
| Product name | Michigan High Resolution Land Cover (MiHRLC) |
| Spatial unit | County products, later assembled into statewide mosaics |
| Primary source imagery | 2022 NAIP county mosaics |
| Source imagery | Four-band, 8-bit unsigned imagery |
| Output resolution | 0.6 m pixels |
| Output format | One-band classified GeoTIFF products |
| Output data type | 8-bit unsigned integer |
| Output no-data value | 255 |
| Main projection observed | WGS 84 / UTM zone 16N |
| Final schema | Nine Chesapeake Bay Level-2 land-cover classes |

The final product was built around county-level processing. Each county was mosaicked, classified, clipped to a buffered county boundary, assigned a standardized raster attribute table and color map, and exported as a county product. Those county products then supported statewide mosaics and web map tile experiments.

## Class Schema

MiHRLC uses the detailed Chesapeake Bay Level-2 land-cover schema used by Esri's pretrained model documentation. [2]

| Value | Class | Standard RGB |
|---:|---|---|
| 1 | Water | `0,197,255` |
| 2 | Wetlands | `0,168,132` |
| 3 | Tree Canopy | `38,115,0` |
| 4 | Shrubland | `76,230,0` |
| 5 | Low Vegetation | `163,255,115` |
| 6 | Barren | `255,170,0` |
| 7 | Structures | `255,0,0` |
| 8 | Impervious Surfaces | `156,156,156` |
| 9 | Impervious Roads | `0,0,0` |
| 255 | NoData / outside product footprint | Transparent or no-data |

Some web previews omit shrubland where it is absent or negligible in a given view. The production schema still reserves value 4 for shrubland.

## Base CNN Lineage

MiHRLC did not begin from a CNN trained entirely from scratch. The workflow used Esri's **High Resolution Land Cover Classification - USA** pretrained deep learning package as the starting point. Esri describes the model as a U-Net architecture implemented in ArcGIS API for Python, with output classes tied to the Chesapeake Bay 2013/2014 land-cover dataset. [1]

The Chesapeake Bay training lineage matters because it shaped both the class definitions and the model's initial learned representation of features such as water, wetlands, tree canopy, low vegetation, structures, roads, and impervious surfaces. The Chesapeake Bay Program land-cover production work used high-resolution NAIP imagery, LiDAR-derived height information, and planimetric data where available to create one-meter land-cover and land-use/land-cover products at regional scale. [4,5]

Esri reports the base pretrained model as applicable across the United States, with best expected performance in the Chesapeake Bay region. That makes Michigan fine-tuning important: Michigan's Great Lakes shoreline, northern forest conditions, agricultural landscapes, seasonality, and 0.6 meter source imagery differ from the base model's strongest training geography and nominal imagery assumptions. [1,2]

## CNN And Training Specifications

Recovered Huron and Crawford model metadata show the following fine-tuned model structure.

| Parameter | Recovered value |
|---|---|
| Model family | U-Net semantic image classifier |
| ArcGIS model name | `UnetClassifier` |
| Model configuration | `_unet` |
| Backend | PyTorch |
| Encoder/backbone | ResNet-34 |
| ArcGIS Learn version | `2.4.1.1` |
| Input bands | Four bands, `ExtractBands: [0, 1, 2, 3]` |
| Training chip size | 512 x 512 pixels |
| Cell size | 0.6 m |
| Image space | `MAP_SPACE` |
| Model tensor format | `NCHW` |
| Multispectral flag | `true` |
| Normalization | Per-band min, max, mean, and standard deviation |
| Learning rate schedule | `slice('7.5858e-06', '7.5858e-05', None)` |
| Inference function | `ArcGISImageClassifier.py` |
| Variable tile size support | `true` |

In practical terms, the model is an encoder-decoder CNN. The ResNet-34 encoder extracts image texture, color, shape, and contextual features from local NAIP image chips. The U-Net decoder projects those features back into a classified raster so each output pixel receives a land-cover class.

## Fine-Tuning And Inference Parameters

The table below separates recovered MiHRLC values from Esri's documented fine-tuning and inference guidance. Some interactive ArcGIS Pro inference arguments were not preserved in the recovered logs, so they are documented as unknown rather than guessed.

| Workflow stage | Parameter | MiHRLC value or status | Esri guidance |
|---|---|---|---|
| Source imagery | Spatial resolution | 0.6 m | High-resolution imagery, generally 80-120 cm |
| Source imagery | Dynamic range | 8-bit unsigned | 8-bit unsigned |
| Source imagery | Bands | Four-band NAIP mosaics | General use page recommends three-band RGB |
| Training export | Image format | TIFF in preserved training metadata | TIFF |
| Training export | Tile size X/Y | 512 x 512 pixels | 512 x 512 pixels |
| Training export | Stride X/Y | Intended setting follows Esri workflow; exact local geoprocessing parameter should be verified if required | 0 / 0 |
| Training export | Metadata format | Classified Tiles | Classified Tiles |
| Training export | Cell size | 0.6 m | Desired cell size during export |
| Training labels | Class schema | Values 1-9 | Chesapeake Bay Level-2 classes |
| Fine-tuning | Pretrained model | High Resolution Land Cover Classification - USA `.dlpk` | Use Esri pretrained `.dlpk` |
| Fine-tuning | Batch size | Not preserved in recovered `.emd` files | Example batch size 8, adjusted to GPU capacity |
| Fine-tuning | Max epochs | Huron ran 21 epochs; Crawford ran 52 epochs | Example maximum 100 with early stopping |
| Fine-tuning | Stop when model stops improving | Likely used based on saved best-epoch history; verify if original logs are needed | Checked in Esri workflow |
| Fine-tuning | Freeze model | Not explicitly preserved in recovered `.emd` files | Checked in Esri workflow |
| Inference | Tool | `Classify Pixels Using Deep Learning` and ArcGIS raster function execution | `Classify Pixels Using Deep Learning` |
| Inference | Detailed classes | Nine-class Level-2 output | Default detailed output is nine classes |
| Inference | `tile_size`, `padding`, `batch_size`, `predict_background`, `test_time_augmentation` | Not fully preserved in recovered logs | Optional inference arguments |
| Final clip | County boundary | Buffered county boundary, commonly 100 m | MiHRLC production choice |

Esri's documentation explains that padding can reduce tile-edge artifacts during inference and that batch size depends on available GPU memory. [2] It also documents the fine-tuning workflow using `Export Training Data For Deep Learning` followed by `Train Deep Learning Model`, with TIFF chips, 512 pixel tile size, stride 0, Classified Tiles metadata, early stopping, and a frozen pretrained model. [3]

## Regional Fine-Tuning Counties

Three counties define the recovered fine-tuning narrative:

| County | Role in production documentation | Recovery status |
|---|---|---|
| Jackson | Early proof-of-concept and revised southern Lower Peninsula production county | Final product and geoprocessing evidence recovered; standalone saved model package not located |
| Huron | Coastal/agricultural/Great Lakes shoreline fine-tuning county | Full model package and training metadata recovered |
| Crawford | Inland/upland, predominantly wooded Northern Lower Peninsula fine-tuning county | Full model package and training metadata recovered |

Roscommon also appears in the final product archive, including later versioned outputs, but Crawford is the stronger wooded Northern Lower Peninsula case for model documentation because its `.emd`, `.dlpk`, `.pth`, training statistics, and validation metrics were recovered.

### Huron Coastal Model

The Huron retrain is the clearest preserved coastal fine-tuning case. It was used to adapt the pretrained CNN to a coastal and agricultural landscape with Great Lakes shoreline context, wetlands, developed features, open fields, and woody cover.

| Metric | Value |
|---|---:|
| Training chips | 47,834 |
| Labeled features | 1,970,506 |
| Epochs | 21 |
| Best epoch | 14 |
| Best validation loss | 0.106400445 |
| Best validation accuracy | 0.966542 |
| Best Dice score | 0.960452 |
| Approximate training time | 19.03 hours |

| Class | F1 |
|---|---:|
| Water | 0.707 |
| Wetlands | 0.626 |
| Tree Canopy | 0.953 |
| Shrubland | 0.000 |
| Low Vegetation | 0.987 |
| Barren | 0.763 |
| Structures | 0.845 |
| Impervious Surfaces | 0.710 |
| Impervious Roads | 0.896 |

The Huron model was strong overall, especially for tree canopy, low vegetation, structures, and roads. Wetlands and water were lower than the headline accuracy, and shrubland was not meaningfully learned in this retrain.

### Crawford Inland Wooded Model

The Crawford retrain is the preserved inland/upland wooded Northern Lower Peninsula model. It is the best recovered evidence for how MiHRLC was adapted to northern forest conditions.

| Metric | Value |
|---|---:|
| Training chips | 15,884 |
| Labeled features | 2,984,891 |
| Epochs | 52 |
| Best epoch | 45 |
| Best validation loss | 0.24815261 |
| Best validation accuracy | 0.924733 |
| Best Dice score | 0.928255 |
| Approximate training time | 15.57 hours |

| Class | F1 |
|---|---:|
| Water | 0.825 |
| Wetlands | 0.431 |
| Tree Canopy | 0.969 |
| Shrubland | 0.096 |
| Low Vegetation | 0.854 |
| Barren | 0.631 |
| Structures | 0.696 |
| Impervious Surfaces | 0.658 |
| Impervious Roads | 0.819 |

The Crawford model performs especially well for tree canopy and reasonably well for low vegetation, water, and roads. Wetlands, barren, structures, impervious surfaces, and shrubland should be interpreted with more caution.

## Production Workflow

The recovered workflow can be summarized as:

1. Assemble county-level NAIP mosaics from source image tiles.
2. Prepare or refine land-cover labels using the Chesapeake Bay Level-2 class schema.
3. Export deep-learning training chips using TIFF format, 512 x 512 tile size, and Classified Tiles metadata.
4. Fine-tune the Esri High Resolution Land Cover Classification - USA model for representative Michigan landscapes.
5. Classify county mosaics in ArcGIS Pro/Image Analyst using the fine-tuned CNN workflow.
6. Clip classified rasters to buffered county boundaries, commonly with a 100 m buffer.
7. Build raster attribute tables and assign standardized class names and RGB values.
8. Export final one-band 8-bit GeoTIFF products.
9. Package county products and assemble statewide mosaic or web-map derivatives.

The recovered ArcGIS tool lineage includes `MosaicToNewRaster`, `ClassifyPixelsUsingDeepLearning`, `ExtractByMask`, `BuildRasterAttributeTable`, `AddField`, `CopyRaster`, and `BuildPyramids`.

## Hardware And Software Environment

The preserved Huron and Crawford model packages report an ArcGIS Pro / ArcGIS Learn environment with ArcGIS Learn version `2.4.1.1`, PyTorch backend, and `ArcGISImageClassifier.py` for inference.

The exact machine used for every original training and inference run should be verified from project notes if needed. The workstation observed during the 2026 recovery and documentation work had the following specifications:

| Component | Observed value |
|---|---|
| CPU | AMD Ryzen 9 7950X 16-Core Processor |
| Logical processors | 32 |
| System memory | Approximately 64 GiB installed |
| GPU | NVIDIA GeForce RTX 5080 |
| GPU memory | 16,303 MiB |
| NVIDIA driver | 610.62 |
| CUDA UMD version reported by `nvidia-smi` | 13.3 |

## Quality Notes And Limitations

The product should be interpreted with the following cautions:

- The Huron and Crawford metrics are model validation-chip metrics, not an independent statewide accuracy assessment.
- The Esri base model metrics describe the pretrained model, not Michigan statewide accuracy.
- Jackson was clearly part of the production and revision story, but a standalone Jackson model package was not located in the recovered archive.
- Exact inference arguments such as tile size, padding, batch size, background prediction, and test-time augmentation were not fully preserved in the recovered logs.
- Shrubland is retained in the class schema but appears weak or absent in the preserved Huron and Crawford retraining metrics.
- A 100 m county buffer means county products may include narrow slivers across county boundaries. That behavior is expected and was used to avoid edge effects along county product borders.

## Recommended Citation

Hopkins, P. A. (2026). *Michigan High Resolution Land Cover Production Documentation*. Mtntheman.com. https://mtntheman.com/mihrlc-production-documentation/

## References

[1] Esri. (n.d.). *High Resolution Land Cover Classification - USA*. ArcGIS Living Atlas model item. Accessed July 20, 2026. <https://www.arcgis.com/home/item.html?id=a10f46a8071a4318bcc085dae26d7ee4>

[2] Esri. (n.d.). *Use the model: High Resolution Land Cover Classification - USA*. ArcGIS AI models documentation. Accessed July 20, 2026. <https://doc.arcgis.com/en/pretrained-models/latest/imagery/using-high-resolution-land-cover-classification-usa.htm>

[3] Esri. (n.d.). *Fine-tune the model: High Resolution Land Cover Classification - USA*. ArcGIS AI models documentation. Accessed July 20, 2026. <https://doc.arcgis.com/en/pretrained-models/latest/imagery/finetuning-the-high-resolution-land-cover-classification-usa.htm>

[4] Claggett, P., Ahmed, L., Buford, E., Czawlytko, J., MacFaden, S., McCabe, P., McDonald, S., O'Neill-Dunne, J., Royar, A., Schulze, K., Soobitsky, R., and Walker, K. (2022). *Chesapeake Bay Program's One-meter Resolution Land Use/Land Cover Data: Overview and Production*. Chesapeake Bay Program technical production document.

[5] Chesapeake Conservancy. (n.d.). *Chesapeake Bay Program Land Use/Land Cover Data Project*. Accessed July 20, 2026. <https://www.chesapeakeconservancy.org/projects/cbp-land-use-land-cover-data-project>
