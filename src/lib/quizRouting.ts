import type { Screen } from "./quizTypes";

export function screenToPath(screen: Screen): string {
  switch (screen) {
    case "menu":
      return "/";
    case "setup":
      return "/setup";
    case "quiz":
      return "/quiz";
    case "result":
      return "/result";
    case "history":
      return "/history";
    case "review":
      return "/review";
    case "exit":
      return "/exit";
  }
}

export function pathToScreen(pathname: string): Screen {
  if (pathname === "/quiz") return "quiz";
  if (pathname === "/result") return "result";
  if (pathname === "/setup") return "setup";
  if (pathname === "/history") return "history";
  if (pathname === "/review") return "review";
  if (pathname === "/exit") return "exit";
  return "menu";
}
