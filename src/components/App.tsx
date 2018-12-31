import * as React from 'react';
import VideoOverlay from './VideoOverlay';
import LabelingCanvas from './LabelingCanvas';
import LocalStorageSync from './LocalStorageSync';
import Toolbar from './Toolbar';
import SettingsPanel from './SettingsPanel';
import HelpPanel from './HelpPanel';
import LabelClassPanel from './LabelClassPanel';
import { downloadVideoFrame } from '../util/dataURL';
import { getVideoID, getYouTubeVideoElem, toggleYouTubeUI } from '../util/youtube';

interface State {
  labels: Label[];
  labeledImages: LabeledImage[];
  labelClasses: string[];
  isLabeling: boolean;
  isSettingsPanelVisible: boolean;
  isHelpPanelVisible: boolean;
  isLabelClassPanelVisible: boolean;
  settings: UserSettings;

  videoScale: number;
  isLocalStorageFull: boolean;
  wasPlayingBeforeLabeling: boolean;
}

const defaultState: State = {
  labels: [],
  labeledImages: [],
  labelClasses: ['foo', 'bar'],
  isLabeling: false,
  isSettingsPanelVisible: false,
  isHelpPanelVisible: false,
  isLabelClassPanelVisible: false,
  settings: {
    skipLength: 10,
    skipLengthFrameRate: 24,
    saveCroppedImages: false,
    saveImagesWithoutLabels: false,
  },

  videoScale: 1,
  wasPlayingBeforeLabeling: false,
  isLocalStorageFull: false,
};

export default class App extends React.Component<{}, State> {
  state = defaultState;

  componentWillMount() {
    getYouTubeVideoElem().addEventListener('play', () =>
      this.state.isLabeling && this.setState({ isLabeling: false }));
  }

  downloadLabeledImages = async () => {
    // TODO
    // await downloadFiles(files, `data.zip`);
  }

  clearLabeledImages = () => confirm('are you sure? will delete all cached images + labels') &&
    this.setState({ labeledImages: [] })
  resetSettings = () => confirm('are you sure you want to reset all settings?') && this.setState({
    ...defaultState,
    labels: this.state.labels,
    labeledImages: this.state.labeledImages,
    isSettingsPanelVisible: this.state.isSettingsPanelVisible,
  })
  clearLabels = () => this.setState({ labels: [] });
  clearLabelClasses = () => this.setState({ labelClasses: [] });

  handleLoadState = (state: State) => this.setState(state);
  handleStorageFull = () => this.setState({ isLocalStorageFull: true });
  handleVideoScaleChange = (videoScale: number) => this.setState({ videoScale });
  handleLabelsChange = (labels: Label[], callback?: () => void) => {
    const labelClasses = new Set(this.state.labelClasses);
    labels.forEach(({ str }) => labelClasses.add(str));
    this.setState({ labels, labelClasses: Array.from(labelClasses) }, callback);
  }
  handleSettingChange = (settings: Partial<UserSettings>) => this.setState({
    settings: {
      ...this.state.settings,
      ...settings,
    },
  })
  toggleSettingsPanel = () => this.setState({ isSettingsPanelVisible: !this.state.isSettingsPanelVisible });
  toggleHelpPanel = () => this.setState({ isHelpPanelVisible: !this.state.isHelpPanelVisible });
  toggleLabelClassPanel = () => this.setState({ isLabelClassPanelVisible: !this.state.isLabelClassPanelVisible });

  startLabeling = () => {
    const wasPlayingBeforeLabeling = !getYouTubeVideoElem().paused;
    getYouTubeVideoElem().pause();
    toggleYouTubeUI(false);
    this.setState({ wasPlayingBeforeLabeling, isLabeling: true });
  }
  stopLabeling = () => {
    if (this.state.wasPlayingBeforeLabeling) {
      getYouTubeVideoElem().play();
    }
    this.setState({ isLabeling: false }, () => toggleYouTubeUI(true));
  }
  skip = () => getYouTubeVideoElem().currentTime += this.state.settings.skipLength / this.state.settings.skipLengthFrameRate;
  prev = () => getYouTubeVideoElem().currentTime -= -this.state.settings.skipLength / this.state.settings.skipLengthFrameRate;
  downloadFrame = (): LabeledImage => {
    const video = getYouTubeVideoElem();
    const time = video.currentTime;
    const frame = Math.floor(time * this.state.settings.skipLengthFrameRate);
    const filename = `_annotate_${getVideoID()}_${frame}.jpg`;
    downloadVideoFrame(video, filename);
    if (this.state.settings.saveCroppedImages) {
      const labelCounts: { [str: string]: number } = {};
      this.state.labels.forEach((label) => {
        if (!labelCounts[label.str]) labelCounts[label.str] = 0;
        labelCounts[label.str] += 1;
        const croppedFilename = `_annotate_${getVideoID()}_${frame}_${label.str}-${labelCounts[label.str]}.jpg`;
        downloadVideoFrame(video, croppedFilename, label.rect);
      });
    }
    return {
      filename,
      frame,
      time,
      labels: this.state.labels,
      url: window.location.href,
      width: video.videoWidth,
      height: video.videoHeight,
    };
  }

  next = () => {
    if (this.state.settings.saveImagesWithoutLabels || this.state.labels.length > 0) {
      const labeledImage = this.downloadFrame();
      this.setState({ labeledImages: this.state.labeledImages.concat([labeledImage]) });
    }
    this.skip();
  }

  render() {
    return (
      <div className="__app">
        <style type="text/css">
        {`
        .__app, .__app *, .__app *:before, .__app *:after {
          box-sizing: border-box;
        }

        .__app button {
          border: 1px outset #ccc;
          background-color: #ccc;
          border-radius: 2px;
          margin: 2px;
          padding: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          color: #222;
          text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.2);
          height: 2.2em;
        }
          .__app button:hover {
            border-color: #aaa;
            background-color: #aaa;
          }
          .__app button:active {
            border-style: inset;
            outline: none;
          }
          .__app button i {
            font-size: 16px;
            vertical-align: middle;
          }
          .__app button i + span {
            margin: 0 2px 0 4px;
          }
        .__app button.icon {
          width: 2.2em;
        }
        .__app fieldset {
          border-radius: 3px;
          border: 1px solid #ddd;
          display: flex;
        }
        `}
        </style>
        <LocalStorageSync
          data={this.state}
          exclude={['isLabeling']}
          localStorageKey="__chrome-youtube-labeler-data"
          onLoad={this.handleLoadState}
          onStorageFull={this.handleStorageFull}
        />
        <Toolbar
          numLabels={this.state.labeledImages.reduce((acc, cur) => acc + cur.labels.length, 0)}
          numLabeledImages={this.state.labeledImages.length}
          numLabelClasses={this.state.labelClasses.length}
          isLabeling={this.state.isLabeling}
          isLocalStorageFull={this.state.isLocalStorageFull}

          startLabeling={this.startLabeling}
          stopLabeling={this.stopLabeling}
          clearLabels={this.clearLabels}
          prev={this.prev}
          skip={this.skip}
          next={this.next}
          downloadLabeledImages={this.downloadLabeledImages}
          clearLabeledImages={this.clearLabeledImages}
          toggleSettingsPanel={this.toggleSettingsPanel}
          toggleHelpPanel={this.toggleHelpPanel}
          toggleLabelClassPanel={this.toggleLabelClassPanel}
        />
        {this.state.isSettingsPanelVisible &&
          <SettingsPanel
            settings={this.state.settings}
            onChange={this.handleSettingChange}
            onClose={this.toggleSettingsPanel}
            onReset={this.resetSettings}
          />
        }
        {this.state.isHelpPanelVisible &&
          <HelpPanel onClose={this.toggleHelpPanel} />
        }
        {this.state.isLabelClassPanelVisible &&
          <LabelClassPanel
            labelClasses={this.state.labelClasses}
            onClose={this.toggleLabelClassPanel}
          />
        }
        <VideoOverlay elem={getYouTubeVideoElem()} onScaleChange={this.handleVideoScaleChange}>
          {this.state.isLabeling &&
            <LabelingCanvas
              labels={this.state.labels}
              classes={this.state.labelClasses}
              scale={this.state.videoScale}
              onLabelsChange={this.handleLabelsChange}
              previousLabelName={this.state.labels.length > 0 ? this.state.labels[this.state.labels.length - 1].str : undefined}
            />
          }
        </VideoOverlay>
      </div>
    );
  }
}
