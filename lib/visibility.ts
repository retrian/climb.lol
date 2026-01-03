export type Visibility = "public" | "unlisted" | "private";

export const visibilityLabels: Record<Visibility, string> = {
  public: "Public",
  unlisted: "Unlisted",
  private: "Private",
};
