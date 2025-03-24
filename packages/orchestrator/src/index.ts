import {
  Pointer,
  PointLessRequest,
  PointLessResponse,
  StorySourceAdapter,
  StoryLocation,
  Story,
  ReferenceStory,
} from "@pointless/types";

export class PointLessOrchestrator {
  private readonly pointer;
  private readonly storySource: StorySourceAdapter;

  constructor(pointer: Pointer, storySource: StorySourceAdapter) {
    this.pointer = pointer;
    this.storySource = storySource;
  }

  async pointStory(request: PointLessRequest): Promise<PointLessResponse> {
    const story = await this.resolveStory(request.story);

    const referenceStories = await this.resolveReferenceStories(
      request.referenceStories
    );

    return this.pointer.point({
      story,
      referenceStories,
      customInstructions: request.customInstructions,
    });
  }

  private async resolveStory(story: Story | StoryLocation): Promise<Story> {
    if (this.isStoryLocation(story)) {
      return this.storySource.fetchStory(story);
    }
    return story;
  }

  private async resolveReferenceStories(
    stories: Array<ReferenceStory | StoryLocation> | undefined
  ): Promise<Array<ReferenceStory>> {
    if (stories) {
      return Promise.all(
        stories.map((story) => this.resolveReferenceStory(story))
      );
    }

    return [];
  }

  private async resolveReferenceStory(
    referenceStory: ReferenceStory | StoryLocation
  ): Promise<ReferenceStory> {
    if (this.isStoryLocation(referenceStory)) {
      return this.storySource.fetchReferenceStory(referenceStory);
    }
    return referenceStory;
  }

  private isStoryLocation(
    story: Story | ReferenceStory | StoryLocation
  ): story is StoryLocation {
    return (story as StoryLocation).source !== undefined;
  }
}
