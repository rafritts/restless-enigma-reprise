import {
  breakEnigma,
  type BombeProgress,
  type BombeResult,
  type BombeSearchCursor,
} from "@restless/enigma";

export type BombeWorkerIn =
  | {
      type: "start";
      message: string;
      crib: string;
      resumeFrom?: BombeSearchCursor | null;
    }
  | { type: "cancel" };

export type BombeWorkerOut =
  | { type: "progress"; progress: BombeProgress }
  | { type: "done"; result: BombeResult }
  | { type: "error"; message: string };

let cancelFlag = false;

self.onmessage = async (ev: MessageEvent<BombeWorkerIn>) => {
  const data = ev.data;
  if (data.type === "cancel") {
    cancelFlag = true;
    return;
  }

  if (data.type === "start") {
    cancelFlag = false;
    try {
      const result = await breakEnigma({
        message: data.message,
        crib: data.crib,
        resumeFrom: data.resumeFrom ?? null,
        progressEvery: 8_000,
        yieldEvery: 1_500,
        shouldCancel: () => cancelFlag,
        onProgress: (progress) => {
          const msg: BombeWorkerOut = { type: "progress", progress };
          self.postMessage(msg);
        },
      });
      const msg: BombeWorkerOut = { type: "done", result };
      self.postMessage(msg);
    } catch (e) {
      const msg: BombeWorkerOut = {
        type: "error",
        message: e instanceof Error ? e.message : "Bombe failed",
      };
      self.postMessage(msg);
    }
  }
};

export {};
