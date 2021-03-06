import * as React from 'react';
import ModalDialog from '../ModalDialog';
import LabelBox from '../LabelBox';
import LabelClassSelector from '../LabelClassSelector';
import videoFrameToDataURL from '../../util/videoFrameToDataURL';

interface Props {
  label: Label;
  onClose: () => void;
  onChange: (label: Label) => void;
  video: HTMLVideoElement | null;
  labelClassSelector: React.ReactElement<LabelClassSelector>;
}

export default class LabelDetailsPanel extends React.Component<Props> {
  state = {
    isClassSelectorVisible: false,
  };

  handleInput = (evt: React.FormEvent<HTMLInputElement>) => this.props.onChange({
    ...this.props.label,
    [evt.currentTarget.name]: evt.currentTarget.type === 'checkbox'
      ? evt.currentTarget.checked
      : evt.currentTarget.value,
  })
  handleSubclassesChange = (evt: React.FormEvent<HTMLTextAreaElement>) => this.props.onChange({
    ...this.props.label,
    subclasses: evt.currentTarget.value.split('\n'),
  })
  toggleClassSelector = () => this.setState({ isClassSelectorVisible: !this.state.isClassSelectorVisible });

  render() {
    return (
      <ModalDialog
        title="Label Details"
        onClose={this.props.onClose}
        buttons={[
          <button key="done" onClick={this.props.onClose} title="Done">
            <i className="fas fa-check" />
            Done
          </button>,
        ]}
      >
        <LabelBox
          label={this.props.label.name}
          style={{ padding: 0, display: 'inline-block' }}
          onLabelClick={this.toggleClassSelector}
        >
          {this.state.isClassSelectorVisible && this.props.labelClassSelector}
          {this.props.video &&
            <img src={videoFrameToDataURL(this.props.video, this.props.label.rect)} style={{ display: 'block' }} />
          }
        </LabelBox>
        <LabelBox label="Pascal VOC XML output">
          <label className="SettingsPanel__inline">
            <div>Occluded</div>
            <input
              type="checkbox"
              checked={this.props.label.truncated || false}
              name="truncated"
              onChange={this.handleInput}
            />
          </label>
          <label className="SettingsPanel__inline">
            <div>Difficult</div>
            <input
              type="checkbox"
              checked={this.props.label.difficult || false}
              name="difficult"
              onChange={this.handleInput}
            />
          </label>
          <label className="SettingsPanel__inline">
            <div>Pose</div>
            <input
              type="text"
              value={this.props.label.pose}
              name="pose"
              onChange={this.handleInput}
            />
          </label>
        </LabelBox>
        <LabelBox label="JSON output">
          <label>
            Subclasses
            <textarea
              onChange={this.handleSubclassesChange}
              value={this.props.label.subclasses ? this.props.label.subclasses.join('\n') : ''}
            />
          </label>
        </LabelBox>
      </ModalDialog>
    );
  }
}
