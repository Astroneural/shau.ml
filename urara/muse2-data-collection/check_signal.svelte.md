---
title: 'Check Muse 2 Signal Quality'
date: 2022-09-4
lastmod: 2022-09-4
tags:
  - 'Muse 2'
---

The Muse 2 EEG is great, but it's not the easiest for developing. Here you'll learn how to check the signal quality to ensure data is high quality. 

## Prerequisites

First you'll need anaconda. After you get that, you'll want to organized everything into a folder. I called this data-collect. Inside that folder, install [eeg-notebooks](https://neurotechx.github.io/eeg-notebooks/getting_started/installation.html). You'll also need BlueMuse, which can be downloaded [here](https://github.com/kowalej/BlueMuse).

```bash
from eegnb.devices.eeg import EEG
from eegnb.analysis.utils import check_report
eeg = EEG(device='muse2')
check_report(eeg)
thresholds = {
        bad: 15,
        good: 10,
        great: 1.5 # Below 1 usually indicates not connected to anything
    }
```

## Running the code

To the run the code, you first have to connect to the Muse headset with BlueMuse. After that's done, simply run

```bash
conda activate eeg-notebooks
python check_signal.py
```

## Interpreting

You should see the output repeatedly checking until all channels are good 2 trials in a row. The "std" stands for standard deviation. Above 15 is bad, below 10 is good, and around 1.5 is great. If it's lower, that might mean the signal is not receiving anything at all. 
