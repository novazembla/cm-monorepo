import { JSDOM } from "jsdom";

export const htmlToString = (html: string, fast?: boolean): string | null => {
  try {
    if (fast) return html.replace(/(<([^>]+)>)/gi, "");

    const dom = new JSDOM(html ?? "");
    return dom?.window?.document?.querySelector("body")?.textContent ?? null;
  } catch (err) {
    return null;
  }
};

export const htmlToText = (str: string) => {
  let out = str.replace(/<br>/g, "BBBRRR<br>");
  out = out.replace(/<br\/>/g, "BBBRRR<br/>");
  out = out.replace(/<\/p>/g, "PPPPPP</p>");
  out = htmlToString(out) ?? "";
  out = out.replace(/BBBRRR/, "\n");
  return out.replace(/PPPPPP/, "\n\n").trim();
};

export const convertToHtml = (str: string) => {
  let out = str.replace(/\r\n/g, "\n");
  out = out.replace(/\r/g, "\n");

  return (
    "<p>" + out.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>"
  );
};

export const htmlToTrimmedString = (
  val: any,
  length: number,
  fast?: boolean
) => {
  if (typeof val !== "string" || val === "") return "";

  let str = htmlToString(val, fast) ?? "";

  if (str.length > length)
    return str.replace(new RegExp("^(.{" + length + "}[^\\s]*).*"), "$1");

  return str;
};
