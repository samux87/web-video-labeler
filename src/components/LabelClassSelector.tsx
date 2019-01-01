import * as React from 'react';
import hashStringToColor from '../util/hashStringToColor';
import './LabelClassSelector.css';

interface Props {
  className?: string;
  classes: string[];
  onClick?: (str: string) => void;
  onRightClick?: (str: string) => void;
  onAddClass?: (str: string) => void;
  showIndex?: boolean;
}

export default class LabelClassSelector extends React.Component<Props> {
  handleClick = (evt: React.FormEvent<HTMLButtonElement>) =>
    this.props.onClick && this.props.onClick(evt.currentTarget.name)

  handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    this.props.onAddClass && this.props.onAddClass((evt.currentTarget[0] as HTMLInputElement).value);
  }

  handleContextMenu = (evt: React.MouseEvent) => {
    evt.preventDefault();
    this.props.onRightClick && this.props.onRightClick((evt.currentTarget as HTMLButtonElement).name);
  }

  render() {
    return (
      <div className={`LabelClassSelector ${this.props.className || ''}`}>
        {this.props.classes.map((labelClass, index) => (
          <button
            name={labelClass}
            onClick={this.handleClick}
            onContextMenu={this.handleContextMenu}
            style={{ backgroundColor: hashStringToColor(labelClass) }}
          >
            {this.props.showIndex && `(${index}) `}
            {labelClass}
          </button>
        ))}
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="new class" />
        </form>
      </div>
    );
  }
}