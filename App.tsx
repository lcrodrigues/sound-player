/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Sound from "react-native-sound";
import { Slider } from "@miblanchard/react-native-slider";
import { RadioButton, Text, Button } from "react-native-paper";

Sound.setCategory("Playback");

interface SoundToPlay {
  soundFile: string;
  bundle: string;
}

function App(): JSX.Element {
  const [selectedSound, setSelectedSound] = useState<SoundToPlay>({
    soundFile: "sound1.mp3",
    bundle: Sound.MAIN_BUNDLE,
  });

  const [progressValue, setProgressValue] = useState(0);
  const [duration, setDuration] = useState(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSliderEditing, setIsSliderEditing] = useState(false);
  const [isRequestingSound, setIsRequestingSound] = useState(false);

  const sound = useMemo(() => {
    return new Sound(selectedSound.soundFile, selectedSound.bundle, (error) => {
      if (error) {
        return;
      } else {
        setDuration(sound.getDuration());

        // will play automatically if the sound is a request from the server
        if (selectedSound.bundle === "") {
          setIsRequestingSound(false);
          play();
        }
      }
    });
  }, [selectedSound]);

  const play = () => {
    setIsPlaying(true);
    sound.play(finishedPlaying);
  };

  const pause = () => {
    sound.pause();
    setIsPlaying(false);
  };

  const finishedPlaying = (success: boolean) => {
    if (success) {
      setIsPlaying(false);
      setProgressValue(0);
    } else {
      console.log("error playing");
    }
  };

  const handleSlideStart = () => {
    setIsSliderEditing(true);
  };

  const handleSlideComplete = (value: number[]) => {
    sound.setCurrentTime(value[0]);
    setIsSliderEditing(false);
  };

  const handleSelectedSound = (newSound: SoundToPlay) => {
    sound.release();
    finishedPlaying(true);

    setSelectedSound(newSound);
  };

  const handleSoundRequest = async () => {
    setIsRequestingSound(true);

    handleSelectedSound({
      soundFile:
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3",
      bundle: "",
    });
  };

  useEffect(() => {
    const timeout = setInterval(() => {
      if (sound && sound.isLoaded() && sound.isPlaying()) {
        sound.getCurrentTime((seconds) => {
          if (!isSliderEditing) {
            setProgressValue(seconds);
          }
        });
      }
    }, 100);

    return () => {
      clearInterval(timeout);
    };
  }, [sound, isSliderEditing]);

  useEffect(() => {
    return () => {
      sound.release();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.requestButtonContainer}>
        <Button
          loading={isRequestingSound}
          mode="contained-tonal"
          onPress={handleSoundRequest}
        >
          Request MP3 audio
        </Button>
      </View>

      <Text style={styles.localSoundsLabel}>Local sounds:</Text>
      <RadioButton.Group
        onValueChange={(value) =>
          handleSelectedSound({ soundFile: value, bundle: Sound.MAIN_BUNDLE })
        }
        value={selectedSound.soundFile}
      >
        <View style={styles.radioOption}>
          <RadioButton value="sound1.mp3" />
          <Text style={styles.radioButtonText}>Sound 1</Text>
        </View>

        <View style={styles.radioOption}>
          <RadioButton value="sound2.mp3" />
          <Text style={styles.radioButtonText}>Sound 2</Text>
        </View>

        <View style={styles.radioOption}>
          <RadioButton value="sound3.mp3" />
          <Text style={styles.radioButtonText}>Sound 3</Text>
        </View>
      </RadioButton.Group>

      <View style={styles.soundPlayer}>
        <View style={styles.playButtonContainer}>
          {isPlaying ? (
            <Button icon="pause" mode="contained-tonal" onPress={pause}>
              Pause
            </Button>
          ) : (
            <Button icon="play" mode="contained-tonal" onPress={play}>
              Play
            </Button>
          )}
        </View>

        <Slider
          onSlidingStart={handleSlideStart}
          onSlidingComplete={handleSlideComplete}
          maximumValue={duration}
          value={progressValue}
          onValueChange={(value) => setProgressValue(value[0])}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
  },

  playButtonContainer: {
    alignSelf: "center",
  },

  requestButtonContainer: {
    alignSelf: "center",
    marginBottom: 32,
  },

  soundPlayer: {
    marginTop: 32,
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioButtonText: {
    marginStart: 4,
  },

  localSoundsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
});

export default App;
