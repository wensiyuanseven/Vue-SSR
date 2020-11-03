import { Configuration } from "webpack";
import unique from "./unique";
import { CustomizeRule, ICustomizeOptions, Key } from "./types";
declare function merge(firstConfiguration: Configuration | Configuration[], ...configurations: Configuration[]): Configuration;
declare function mergeWithCustomize(options: ICustomizeOptions): (firstConfiguration: Configuration | Configuration[], ...configurations: Configuration[]) => Configuration;
declare function customizeArray(rules: {
    [s: string]: CustomizeRule;
}): (a: any, b: any, key: Key) => any;
declare type Rules = {
    [s: string]: CustomizeRule | Rules;
};
declare function mergeWithRules(rules: Rules): (firstConfiguration: Configuration | Configuration[], ...configurations: Configuration[]) => Configuration;
declare function customizeObject(rules: {
    [s: string]: CustomizeRule;
}): (a: any, b: any, key: Key) => any;
export { customizeArray, customizeObject, CustomizeRule, merge, merge as default, mergeWithCustomize, mergeWithRules, unique };
