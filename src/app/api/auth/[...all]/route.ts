import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
export const runtime = "nodejs";
const handlers = toNextJsHandler(auth);

let signupQueue = Promise.resolve();

async function serializeSignup<T>(work: () => Promise<T>): Promise<T> {
  const previous = signupQueue;
  let release!: () => void;
  signupQueue = new Promise<void>(resolve => { release = resolve; });
  await previous;
  try {
    return await work();
  } finally {
    release();
  }
}

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
export async function POST(request: Request) {
  if (new URL(request.url).pathname.endsWith("/sign-up/email")) {
    return serializeSignup(() => handlers.POST(request));
  }
  return handlers.POST(request);
}
