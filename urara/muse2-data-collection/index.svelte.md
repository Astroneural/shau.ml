---
title: 'Collect Real-Time Data from Muse 2 EEG With Markers (Windows)'
date: 2022-11-07
lastmod: 2022-11-07
tags:
  - 'Muse 2'
cover: '/hello-world/cover.webp'
---

So you got yourself a Muse 2 EEG Headset, only to your great dismay Interaxon (it's maker) doesn't provide software to get raw data from it for research. Then you realise you can get data over Bluetooth, so you try connecting to your computer. . . it doesn't work! So then you try connecting to your phone. It works! Huzzah! But wait. . . to access the data I need a paid app!? (Mind Monitor is great, I hear, don't get me wrong, it's just I think it's better to try the free stuff first). Or maybe that's just me and you knew what to do from the start. Anyway, here's how to collect raw EEG data from Muse 2 with markers for stimuli.

## Prerequisites

To collect data, you'll need to connect to an LSL stream at one point, so let's install that now (there are other options but this is generally preffered). Options include [BlueMuse](https://github.com/kowalej/BlueMuse), [muselsl](https://github.com/alexandrebarachant/muse-lsl), [eeg-notebooks](https://github.com/NeuroTechX/eeg-notebooks), or [BrainFlow](https://brainflow.org/get_started/?manufactorer=Muse&board=muse2&). Instructions for installing are available on the corresponding websites. Personally, I chose BlueMuse, although muselsl has a very easy way to view data.

Now that's done, let's take a look at the libraries we'll need. You can install these in your regular terminal/command prompt or in an anaconda environment. Numpy and Pandas are pretty standard, pylsl allows us to connect to the lsl stream created by (in my case) BlueMuse, and sklearn is used for its linear regression algorithm which we use to dejitter the signal (I believe all of these are included in anaconda, save pylsl).

```bash
pip install numpy pandas pylsl sklearn 
```

And now you're ready to use these libraries in your code to collect the data! The two files you'll need will be called markers.py and record.py. 

## Stream Markers

Markers are used as the label column for data analysis. This is also necessary for machine learning (which is a form of data analysis). 

Here's the code for markers.py, adapted from [here](https://github.com/labstreaminglayer/liblsl-Python/blob/master/pylsl/examples/SendStringMarkers.py)

```bash
import random
import time

from pylsl import StreamInfo, StreamOutlet

info = StreamInfo('MyMarkerStream', 'Markers', 1, 0, 'string', 'myuidw43536') # these don't really matter
# and don't worry, you don't need to change myuid, that'll work for everyone

# make an outlet
outlet = StreamOutlet(info)

print("now sending markers...")
markernames = ['MARKERS'] # neither does this
while True:
    # pick a sample to send an wait for a bit
    outlet.push_sample([random.choice(markernames)])
    time.sleep(random.random() * 3) 
```

## Record Code

This is the code for record.py which I got from [here](https://towardsdatascience.com/merging-with-ai-how-to-make-a-brain-computer-interface-to-communicate-with-google-using-keras-and-f9414c540a92) and was apparently first from [Neurotech@Berkley(https://github.com/neurotech-berkeley). Change your word bank in line 65. The word bank is used as a stimulus or prompt. For a visual stimulus, you can alter code for the n170 experiment in eeg-notebooks (however the markers column was not working for me). 

```bash
import numpy as np
import pandas as pd
import random
from time import time, strftime, gmtime
from optparse import OptionParser
from pylsl import StreamInlet, resolve_byprop
from sklearn.linear_model import LinearRegression

default_fname = ("data/data_%s.csv" % strftime("%Y-%m-%d-%H.%M.%S", gmtime())) # make sure to create a folder called 'data' for it to go in
parser = OptionParser()
parser.add_option("-d", "--duration",
                  dest="duration", type='int', default=15, # default is the duration of the recording
                  help="duration of the recording in seconds.")
parser.add_option("-f", "--filename",
                  dest="filename", type='str', default=default_fname,
                  help="Name of the recording file.")

# dejitter timestamps
dejitter = False

(options, args) = parser.parse_args()



print("looking for an EEG stream...")
streams = resolve_byprop('type', 'EEG', timeout=2)

if len(streams) == 0:
    raise(RuntimeError, "Cant find EEG stream")

print("Start aquiring data")
inlet = StreamInlet(streams[0], max_chunklen=12)
eeg_time_correction = inlet.time_correction()


print("looking for a Markers stream...")
marker_streams = resolve_byprop('type', 'Markers', timeout=2)

if marker_streams:
    inlet_marker = StreamInlet(marker_streams[0])
    marker_time_correction = inlet_marker.time_correction()
else:
    inlet_marker = False
    print("Cant find Markers stream")

info = inlet.info()
description = info.desc()

freq = info.nominal_srate()
Nchan = info.channel_count()

ch = description.child('channels').first_child()
ch_names = [ch.child_value('label')]
for i in range(1, Nchan):
    ch = ch.next_sibling()
    ch_names.append(ch.child_value('label'))


# Word Capturing    
currentWord = 1
currentTerm = "HELLO"
t_word = time() + 1 * 2 # the stimulus changes every 2 seconds
words = []
terms = []
termBank = ["WORLD"] # feel free to use your own!

res = []
timestamps = []
markers = []
t_init = time()
print('Start recording at time t=%.3f' % t_init)
print(currentTerm)
while (time() - t_init) < options.duration:
	# Check for new word
    if time() >= t_word:
        currentTerm = random.choice(termBank)
        print("\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n" + str(currentWord) +": " +currentTerm)
        currentWord += 1
        t_word = time() + 1 * 2
    try:
        data, timestamp = inlet.pull_chunk(timeout=1.0, max_samples=12)
        if timestamp:
            res.append(data)
            timestamps.extend(timestamp)
            words.extend([currentWord] * len(timestamp))
            terms.extend([currentTerm] * len(timestamp))
        if inlet_marker:
            marker, timestamp = inlet_marker.pull_sample(timeout=0.0)
            if timestamp:
                markers.append([marker, timestamp])
    except KeyboardInterrupt:
        break

res = np.concatenate(res, axis=0)
timestamps = np.array(timestamps)

if dejitter:
    y = timestamps
    X = np.atleast_2d(np.arange(0, len(y))).T
    lr = LinearRegression()
    lr.fit(X, y)
    timestamps = lr.predict(X)

res = np.c_[timestamps, words, terms, res]
data = pd.DataFrame(data=res, columns=['timestamps'] + ['words'] + ['terms'] + ch_names)

data['Marker'] = 0
# process markers:
for marker in markers:
    # find index of margers
    ix = np.argmin(np.abs(marker[1] - timestamps))
    val = timestamps[ix]
    data.loc[ix, 'Marker'] = marker[0][0]


data.to_csv(options.filename, float_format='%.3f', index=False)

print('Done !')
print(default_fname)
```

## Collecting the Data

Great, that's all the preparation. Now, you can run markers.py in one prompt with 

`python markers.py`

and you should see the following: `now sending markers. . .`

Next, before you start recording.py, you need to initiate the lsl stream. To do this, simply turn on your Muse 2 and open BlueMuse and click start streaming. Or for any other lsl streamer you installed, instructions should be on the corresponding sites or elsewhere. For muselsl for example, simply use `muselsl stream`). 

And that's all! When you're done executing, recording.py should output the .csv file location, so just copy and paste that into File Explorer and admire your data! You could always plot it, too. 
