/**
 * Common types and interfaces for the Point.Less project
 */

/**
 * Story to be estimated
 */
export interface Story {
  title?: string;
  content: string;
}

/**
 * Reference story for point estimation
 */
export interface ReferenceStory extends Story {
  points: number;
}

/**
 * Location of a story
 */
export interface StoryLocation {
  source: "jira" | "github";
  issue: string; // SCRUM-1 or 1
  url?: string; // https://your-domain.atlassian.net or https://github.com/stevenrein20/point.less
  authorization?: string; // Bearer token or PAT
}

/**
 * Request structure for point estimation
 */
export interface PointerRequest {
  story: Story;
  referenceStories?: Array<ReferenceStory>;
  customInstructions?: string;
}

/**
 * Response structure for point estimation
 */
export interface PointerResponse {
  points: number;
  explanation: string;
}

/**
 * Pointer interface for point estimation
 */
export abstract class Pointer {
  abstract point(request: PointerRequest): Promise<PointerResponse>;
}

/**
 * Story source adapter interface for fetching stories
 */
export abstract class StorySourceAdapter {
  abstract fetchStory(story: StoryLocation): Promise<Story>;
  abstract fetchReferenceStory(
    location: StoryLocation
  ): Promise<ReferenceStory>;
}

/**
 * What should this eveutally include. It should someday have:
 *  - model/provider selection (optional)
 *  - reference stories could also include links to github PRs where we can look at commits and diffs.
 */
/**
 * Request structure for point estimation
 */
export interface PointLessRequest {
  story: Story | StoryLocation;
  referenceStories?: Array<ReferenceStory | StoryLocation>;
  customInstructions?: string;
}

/**
 * Response structure for point estimation
 */
export interface PointLessResponse {
  points: number;
  explanation: string;
}
