import test from "node:test";
import assert from "node:assert/strict";
import { AiConfig } from "../js/ai-config.js";

test("API Key remains in memory and produces request body fields", () => {
  AiConfig.clear();
  AiConfig.selectProvider("deepseek");
  AiConfig.setKey("deepseek", "  test-secret  ");
  assert.deepEqual(AiConfig.getRequestBodyFields(), {
    modelProvider: "deepseek",
    modelApiKey: "test-secret",
  });
});

test("providers keep separate in-memory keys", () => {
  AiConfig.clear();
  AiConfig.setKey("zhipu", "zhipu-key");
  AiConfig.setKey("groq", "groq-key");
  AiConfig.selectProvider("groq");
  assert.equal(AiConfig.getConfig().apiKey, "groq-key");
  AiConfig.selectProvider("zhipu");
  assert.equal(AiConfig.getConfig().apiKey, "zhipu-key");
});

test("empty key preserves the existing platform path", () => {
  AiConfig.clear();
  assert.deepEqual(AiConfig.getRequestBodyFields(), {});
  assert.equal(AiConfig.getConfig().hasCustomKey, false);
});

test("every provider includes a signup link and application guide", () => {
  for (const provider of Object.values(AiConfig.providers)) {
    assert.match(provider.signupUrl, /^https:\/\//);
    assert.equal(provider.guideSteps.length, 3);
    assert.ok(provider.guideSteps.every(Boolean));
  }
});
