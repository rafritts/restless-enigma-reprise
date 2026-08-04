import { describe, expect, it } from "vitest";
import {
  DEFAULT_CRIB,
  decodeMessageStripCrib,
  encodeMessage,
  encodeMessageWithCrib,
  type EnigmaSettings,
} from "./index";

const testSettings: EnigmaSettings = {
  rotor1Position: "A",
  rotor2Position: "A",
  rotor3Position: "D",
  plugboardSwaps: { A: "B", B: "A" },
};

const shortOriginal = "This is a test message";
const longOriginal =
  "The Enigma machine, used by Germany during World War II, was an electro-mechanical device that encrypted messages using a complex series of rotors and a plugboard to create a vast number of possible settings, making its ciphers extremely difficult to break. Each day, the machine's settings were changed, based on secret key lists. Alan Turing, a brilliant mathematician and cryptanalyst, played a pivotal role in breaking the Enigma code. At Bletchley Park in the UK, Turing and his team developed the Bombe machine, a device that could rapidly test different settings of the Enigma machine. By exploiting known flaws in the Enigma's method and using captured key information, the Bombe was able to significantly reduce the number of potential settings that needed to be checked manually, eventually allowing the Allies to intercept and decrypt German communications, which was crucial in turning the tide of the war.";

describe("EnigmaMachine", () => {
  it("encodes with default crib", () => {
    const encoded = encodeMessageWithCrib(shortOriginal, DEFAULT_CRIB, testSettings);
    expect(encoded).toBe("WJQUBYSCWX KQEG DY Y KXXV UKBORUR");
  });

  it("decodes with crib strip", () => {
    const decoded = decodeMessageStripCrib(
      "WJQUBYSCWX KQEG DY Y KXXV UKBORUR",
      DEFAULT_CRIB,
      testSettings,
    );
    expect(decoded).toBe(shortOriginal.toUpperCase());
  });

  it("encodes without crib", () => {
    expect(encodeMessage(shortOriginal, testSettings)).toBe("CIEP QY N KDDK ZIGTPEX");
  });

  it("decodes without crib (reciprocal)", () => {
    expect(encodeMessage("CIEP QY N KDDK ZIGTPEX", testSettings)).toBe(
      "THIS IS A TEST MESSAGE",
    );
  });

  it("round-trips a full paragraph", () => {
    const encoded = encodeMessage(longOriginal, testSettings);
    expect(encoded).toBe(
      "CII JJEWPP KYLJAJI, LMXM YH CRBLXZJ MLAEIQ QPYSM FMF YY, HIY PD IMNRMQC-XGWXDKKMZU ZPSDFY NBXN GJNXPBDAG AQMUPDSJ TMJGO M YMYDTAB DOLGAG TJ ITUILU SVE Q GBAXLGQXX VJ EZMXVM I GQKC OQTLCL RW RIWOPLSB ECMYHOCM, TZSOLS YMA PPALRUG WMZFTIDRJ WZVHBAZZM VS JJGLI. XLTL ZLI, RFN NLAGZIW'Q YPWIJLLV CKFG JCDQLGA, TILAM MD YSEQSX RUC AEERZ. WKCV YZGJTN, S KQYGVYSTU IREWVSBJZUVRC SIN LCIJRJQHPBEU, BSHLDS I QZYPVZR OFVJ GE MKCSWGKC PMM LYBYTS HISI. NN WNQWKQCSB BSVZ HB NWI RH, QVLYVE TIF QNA FQSP TLQDNMMQF CFF OSRYG DYNAVZQ, Y CQJVXF SXNB DXKGK YSXMRHR CTTW BKJYTYZMS OFSZAKQA BS ISB XYQLQQ VKQIPCN. QP GPQHNABLUS XOUUO HBZOM LK ZEA CEFHUW'C ISMZXU PLG VGFGA KPLQLQAK FNQ LEJQTGIRZJH, DWP VBAPD RCX BMIX NP CWQPFELSUEOCL NUWHLW GGV IFOWTP MU RMRNKQCCN LNQEFLDQ GWBF AQXYVS ZP EX JXXJTXY EBCOKCME, NTXMIROWMK HMDAQMAC JZR VZEMSA JY ERPVOBVWP LVU QNYSJUN NQIYFS OZPYRIEKFKUZOV, DDWRK BQC TXEMKWR WH WDJJGOV WJU WVFZ ZE SIH RDY.",
    );
    expect(encodeMessage(encoded, testSettings)).toBe(longOriginal.toUpperCase());
  });
});
