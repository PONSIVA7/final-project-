import React from "react";

import Variable from "../models/Variable";
import StackFrameCard from "../visualization/StackFrameCard";
import VariableCard from "../visualization/VariableCard";
import VisualConstants from "./VisualConstants";

export default class VisualizationTool {
  static get Layouts() {
    return { ROW: "ROW", COLUMN: "COLUMN" };
  }

  static getVariableCardDimensions(variable) {
    const { type, name } = variable;

    let calculatedHeight = VisualConstants.VariableCard.SIZING.HEIGHT;
    let maxFieldWidth = 0;
    if (variable.cType === Variable.CTypes.STRUCT) {
      const offsetY = 15;
      const fields = Object.values(variable.value);
      calculatedHeight = fields.map(v => VisualizationTool.getVariableCardDimensions(v).height)
        .reduce((total, height) => total + height + offsetY);
      calculatedHeight += VisualConstants.VariableCard.SIZING.TITLE_HEIGHT + offsetY;
      maxFieldWidth = Math.max.apply(null, fields.map(v => VisualizationTool.getVariableCardDimensions(v).width));
    }

    const titleWidth = type.length + name.length + 2;
    const valueWidth = variable.getValue().toString().length * 1.25 + 2;
    const minWidth = VisualConstants.VariableCard.SIZING.MIN_WIDTH;

    console.log(titleWidth, valueWidth, maxFieldWidth, minWidth);

    let calculatedWidth = Math.max(Math.max(titleWidth, valueWidth, minWidth) * 10 + 7, maxFieldWidth + 14);

    return {
      width: calculatedWidth,
      height: calculatedHeight
    };
  }

  static getStackFrameCardDimensions(stackFrame) {
    const offsetY = 15;
    let calculatedHeight = stackFrame.getLocalVariables()
      .map(v => VisualizationTool.getVariableCardDimensions(v).height)
      .reduce((total, height) => total + height + offsetY);
    calculatedHeight += VisualConstants.StackFrameCard.SIZING.TITLE_HEIGHT + offsetY + 5;
    return {
      width: Math.max(stackFrame.funcName.length * 2, 20) * 20,
      height: Math.max(calculatedHeight, VisualConstants.StackFrameCard.SIZING.MIN_HEIGHT)
    };
  }

  static getColor(component) {
    if (component instanceof VariableCard) {
      const COLOR_TYPES = VisualConstants.VariableCard.COLORS.TYPES;
      return COLOR_TYPES[component.props.variable.type] || COLOR_TYPES.DEFAULT;
    } else if (component instanceof StackFrameCard) {
      const { ACTIVE, INACTIVE } = VisualConstants.StackFrameCard.COLORS;
      return component.props.active ? ACTIVE : INACTIVE;
    }
  }

  // nodes: a list of node objects each expected to have { width, height, component }
  // origin: a point of origin with fields { x, y } (considered to be the top left)
  // offset: the amount to offset between each element with fields { x, y }
  // layout: either row or column
  // returns: a list of node components to be rendered by React's render() method
  static layoutNodes(nodes, origin = { x: 0, y: 0 }, offset = { x: 0, y: 0 }, layout) {
    let x = origin.x;
    let y = origin.y;
    return nodes.map((node, index) => {
      const newComponent = React.cloneElement(node.component, { x, y });
      if (layout === VisualizationTool.Layouts.ROW) x += node.width;
      else if (layout === VisualizationTool.Layouts.COLUMN) y += node.height;
      x += offset.x;
      y += offset.y;
      return newComponent;
    });
  }
}