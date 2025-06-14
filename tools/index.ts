import { fileRead } from "./fileRead.js";
import { fileList } from "./fileList.js";
import { fileWrite } from "./fileWrite.js";
import { Tool } from "../main.js";

export const tools: Tool[] = [fileRead, fileList, fileWrite];
