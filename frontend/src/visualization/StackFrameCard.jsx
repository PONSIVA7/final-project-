import React, { Component } from "react";
import PropTypes from "prop-types";
import { Rect, Text, Group } from "react-konva";

import VariableCard from "./VariableCard";
import VisualizationTool from "../utils/VisualizationTool";
import { StackFrameCard as VisualConstants } from "../utils/VisualConstants";

export default class StackFrameCard extends Component {
  static get propTypes() {
    return {
      traceStep: PropTypes.object.isRequired,
      stackFrame: PropTypes.object.isRequired,
      updateVisualization: PropTypes.func.isRequired,
      active: PropTypes.bool,
      x: PropTypes.number,
      y: PropTypes.number
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      ...VisualizationTool.getStackFrameCardDimensions(this.props.stackFrame)
    };
  }

  componentWillReceiveProps({ stackFrame, active }) {
    if (!active && !VisualizationTool.isExpanded(stackFrame)) {
      const localNodes = this.props.stackFrame.getLocalVariables();
      if (localNodes.length !== stackFrame.getLocalVariables().length) {
        VisualizationTool.registerStackFrame(stackFrame, true, active);
      } else {
        for (let i = 0; i < localNodes.length; i++) {
          if (!localNodes[i].hasSameValue(stackFrame.getLocalVariables()[i])) {
            VisualizationTool.registerStackFrame(stackFrame, true, active);
            break;
          }
        }
      }
    }
    this.setState({ ...VisualizationTool.getStackFrameCardDimensions(stackFrame) });
  }

  getOutline() {
    return (
      <Rect
        x={this.props.x}
        y={this.props.y}
        width={this.state.width}
        height={this.state.height}
        fill={VisualConstants.COLORS.BODY}
        stroke={VisualizationTool.getColor(this)}
        strokeWidth={VisualConstants.SIZING.OUTLINE_WIDTH}
        cornerRadius={VisualConstants.SIZING.CORNER_RADIUS}
      />
    );
  }

  getTitleBackground() {
    return (
      <Group>
        <Rect
          x={this.props.x}
          y={this.props.y}
          width={this.state.width}
          height={VisualConstants.SIZING.RECT_UPPER_HEIGHT}
          fill={VisualizationTool.getColor(this)}
          cornerRadius={VisualConstants.SIZING.CORNER_RADIUS}
        />
        <Rect
          x={this.props.x}
          y={this.props.y + 10}
          width={this.state.width}
          height={VisualConstants.SIZING.RECT_LOWER_HEIGHT}
          fill={VisualizationTool.getColor(this)}
        />
      </Group>
    );
  }

  getTitleText() {
    return (
      <Text
        text={this.props.stackFrame.getFuncName()}
        x={this.props.x}
        y={this.props.y + 3}
        fontSize={VisualConstants.FONT.TITLE_SIZE}
        fontFamily={VisualConstants.FONT.FAMILY}
        align={VisualConstants.ALIGNMENT.TITLE}
        width={this.state.width}
        onClick={() => this.toggleOpen()}
      />
    );
  }

  getTitleSegment() {
    return (
      <Group>
        {this.getTitleBackground()}
        {this.getTitleText()}
      </Group>
    );
  }

  getLocalVariableNodes() {
    const nodesToLayout = this.props.stackFrame.getLocalVariables().map(v => {
      if (v.isPointer()) {
        const pointeeComponent = VisualizationTool.getComponentByAddress(v.getValue());
        if (pointeeComponent && pointeeComponent.variable.stackFrame) {
          const stackFrameInfo = VisualizationTool.stackFrames[pointeeComponent.variable.stackFrame];
          if (stackFrameInfo && !stackFrameInfo.pointee && !stackFrameInfo.closedPointee) {
            VisualizationTool.stackFrames[pointeeComponent.variable.stackFrame.getId()].pointee = true;
            this.props.updateVisualization();
            this.props.updateVisualization();
          }
        }
      }
      const component = <VariableCard key={v.getId()} variable={v} traceStep={this.props.traceStep} x={this.props.x + 35}
                                      y={this.props.y + VisualConstants.SIZING.ORIGIN_Y_OFFSET} updateVisualization={this.props.updateVisualization}/>;
      return { ...VisualizationTool.getVariableCardDimensions(v), component };
    });
    return VisualizationTool.layoutNodes({
      nodes: nodesToLayout,
      origin: { x: this.props.x + 7, y: this.props.y + VisualConstants.SIZING.ORIGIN_Y_OFFSET },
      offset: { x: 0, y: VisualConstants.SIZING.OFFSET },
      traceStep: this.props.traceStep,
      layout: VisualizationTool.Layouts.COLUMN
    });
  }

  toggleOpen() {
    VisualizationTool.toggleStackFrame(this.props.stackFrame);
    this.setState({
      ...VisualizationTool.getStackFrameCardDimensions(this.props.stackFrame)
    }, () => {
      VisualizationTool.clearRegisteredComponents();
      this.props.updateVisualization();
      this.props.updateVisualization();
    });
  }

  render() {
    return (
      <Group draggable>
        {this.getOutline()}
        {this.getTitleSegment()}
        {VisualizationTool.isExpanded(this.props.stackFrame) && this.getLocalVariableNodes()}
      </Group>
    );
  }
}
