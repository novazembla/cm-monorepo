export const htmlToString = (html: string): string | null => {
  try {
    if (typeof window !== "undefined") {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText;
    } else {
      return html.replace(/(<([^>]+)>)/gi, "");
    }
  } catch (err) {
    return "";
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

export const isEmptyHtml = (html: string) => {
  if (!html) return true;

  if (typeof html !== "string") return true;

  if (html.length === 0) return true;

  try {
    if (typeof DOMParser !== "undefined") {
      const dom = new DOMParser().parseFromString(html ?? "", "text/html");
      return (dom?.body?.textContent ?? "").trim().length === 0;
    } else {
      return html.replace(/(<([^>]+)>)/gi, "").trim().length === 0;
    }
  } catch (err) {}
  return true;
};

export const htmlToTrimmedString = (val: any, length: number) => {
  if (typeof val !== "string") return val;

  let str = htmlToString(val) ?? "";

  if (str.length > length)
    return `${str.replace(new RegExp("^(.{" + length + "}[^\\s]*).*"), "$1")}`;

  return str;
};
