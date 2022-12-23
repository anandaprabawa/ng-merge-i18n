import { AppBuilderContext } from "../interfaces/app-builder-context.interface";
import { ProjectMetadata } from "../interfaces/project-metadata.interface";

export class ProjectService {
  constructor(private context: AppBuilderContext) {}

  async getActiveProjectMetadata(): Promise<ProjectMetadata> {
    const metadata = await this.context.getProjectMetadata(this.context.target.project);
    return metadata as unknown as ProjectMetadata;
  }
}
