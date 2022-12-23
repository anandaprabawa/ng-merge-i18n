import { BuilderContext, Target } from "@angular-devkit/architect";

/**
 * Enhanced {@link BuilderContext} to make `target` property not optional.
 */
export interface AppBuilderContext extends BuilderContext {
  target: Target;
}
