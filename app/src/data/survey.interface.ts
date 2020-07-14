export interface Survey {
  id: number,
  title: string,
  description: string,
  type: "profile" | "pre-campaign" | "post-campaign",
  questions: Array<number>
}
