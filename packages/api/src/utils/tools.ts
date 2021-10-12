export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const isObject = (objValue: any) => {
  return (
    objValue && typeof objValue === "object" && objValue.constructor === Object
  );
};

export const convertToHtml = (str: string) => {
  let out = str.replace(/\r\n/g, "\n");
  out = out.replace(/\r/g, "\n");

  return (
    "<p>" + out.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>"
  );
};

export const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));
