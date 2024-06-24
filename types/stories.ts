export interface Page {
  txt: string;
  png: string;
}

export interface Story {
  name?: string;
  pages: Page[];
  story: string;
}
