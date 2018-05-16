import Utils from "../utils/Utils";
import Variable from "./Variable";

export default class StackFrame {
  constructor({ frame_id, func_name, is_highlighted, is_parent, is_zombie, line, parent_frame_id_list, unique_hash,
                encoded_locals, ordered_varnames }, heap = {}) {
    this.frameId = frame_id;
    this.funcName = func_name;
    this.isHighlighted = is_highlighted;
    this.line = line;
    this.isParent = is_parent;
    this.isZombie = is_zombie;
    this.parentFrameIdList = parent_frame_id_list;
    this.uniqueHash = unique_hash;
    this.encodedLocals = Utils.mapValues(Variable, encoded_locals, varData => new Variable(varData, heap, unique_hash));
    this.orderedVarnames = ordered_varnames;
  }

  getLocalVariables() {
    return this.orderedVarnames.map(varName => this.encodedLocals[varName].withName(varName));
  }

  getFuncName() {
    const parenIndex = this.funcName.indexOf("(");
    if (parenIndex !== -1) {
      return this.funcName.substring(0, parenIndex);
    }
    return this.funcName;
  }

  toString() {
    return `${this.getFuncName()} ${this.frameId ? `(${this.frameId})` : ""}`.trim();
  }
}
