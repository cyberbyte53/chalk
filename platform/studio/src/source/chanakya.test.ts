import { describe, expect, it } from "vitest";
import { fromChanakya } from "./chanakya";

describe("fromChanakya", () => {
  it.each([
    ["funsZ'kkad T;kfefr", "निर्देशांक ज्यामिति"],
    ["fcUnq", "बिन्दु"],
    ["osQ vko`Qfr 3-1", "के आकृति 3.1"],
    ["ÅèokZ/j", "ऊर्ध्वाधर"],
    ["prqFkk±'k", "चतुर्थांश"],
    ["ØkW¯lx", "क्रॉसिंग"],
    ["vafdr", "अंकित"],
    ["yasxs", "लेंगे"],
    ["D;kasa", "क्यों"],
    ["esas", "में"],
    ["vr% dhft,%", "अतः कीजिए:"],
    ["lM+osaQ fiQj", "सड़कें फिर"],
    ["^^ugha** ¶fcUnq gS¸", "“नहीं” “बिन्दु है”"],
  ])("%s → %s", (code, text) => {
    expect(fromChanakya(code)).toBe(text);
  });
});
