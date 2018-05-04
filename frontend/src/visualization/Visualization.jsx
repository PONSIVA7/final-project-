import React, { Component } from "react";
import PropTypes from "prop-types";
import { Layer, Stage } from "react-konva";

import StackFrameCard from "./StackFrameCard";
import VariableCard from "./VariableCard";
import VisualizationTool from "../utils/VisualizationTool";
import DomCard from "../components/DomCard";

export default class Visualization extends Component {
  static get propTypes() {
    return {
      width: PropTypes.number,
      height: PropTypes.number,
      trace: PropTypes.object
    };
  }

  getHeapVariableNodes() {
    const heapVars = this.props.trace.getCurrentStep().getHeapVariables();
    return heapVars.map(v => {
      const dimensions = VisualizationTool.getVariableCardDimensions(v);
      return {...dimensions, component: <VariableCard key={v.name} variable={v}/>};
    });
  }

  getGlobalVariableNodes() {
    return this.props.trace.getCurrentStep().getGlobalVariables().map(v => {
      const dimensions = VisualizationTool.getVariableCardDimensions(v);
      return {...dimensions, component: <VariableCard key={v.name} variable={v}/>};
    });
  }

  getStackFrameNodes() {
    const currentStep = this.props.trace.getCurrentStep();
    return currentStep.stack.map(frame => {
      const active = frame === currentStep.getCurrentStackFrame();
      const dimensions = VisualizationTool.getStackFrameCardDimensions(frame);
      return {
        ...dimensions,
        component: <StackFrameCard key={frame.toString()} stackFrame={frame} active={active}/>
      };
    });
  }

  getAllNodes() {
    const origin = {x: 10, y: 40};
    const offset = {x: 0, y: 15};
    const nodesToLayout = [...this.getGlobalVariableNodes(), ...this.getStackFrameNodes(), ...this.getHeapVariableNodes()];
    return VisualizationTool.layoutNodes(nodesToLayout, origin, offset, VisualizationTool.Layouts.COLUMN);
  }

  render() {
    let height = this.props.height*.87
    if (!this.props.trace) {
      return (
        <div className="visualization" style={{width: this.props.width, height: this.props.height}}>
          <DomCard splitTitle={true} height={height} title="Stack" title2="Heap" color="lightgray" bodyStyle={{width: this.props.width, height: height}}/>
        </div>
      );
    } else {
      return (
        <div className="visualization" style={{width: this.props.width, height: this.props.height}}>
          <DomCard splitTitle={true}  height={height}  title="Stack" title2="Heap" color="lightgray" bodyStyle={{width: this.props.width, height: height}}>
            <Stage draggable width={this.props.width} height={this.props.height}>
              <Layer>
                {this.getAllNodes()}
              </Layer>
            </Stage>

          </DomCard>
        </div>
      );
    }
  }
}