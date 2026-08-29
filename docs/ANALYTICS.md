# Analytics & Privacy Architecture

## Privacy-First Telemetry Principles

1. **Zero Prompt Collection**: Prompt text, character strings, and API keys are never collected, logged, or transmitted.
2. **Decoupled Provider Interface**: Event tracking is routed through `lib/analytics/index.ts`.
3. **Non-Blocking Execution**: Analytics dispatches occur asynchronously and silently fail to prevent blocking UI interactions.

## Supported Events

| Event Name | Trigger | Payload Metadata |
|------------|---------|-------------------|
| `page_view` | Page load | `route` |
| `calculator_used` | User edits inputs | `modelId`, `provider` |
| `model_selected` | User selects model | `modelId`, `provider` |
| `comparison_created` | Model added to compare | `count` |
| `result_copied` | Copy summary clicked | `modelName`, `provider` |
| `result_shared` | Share link clicked | `modelName` |
