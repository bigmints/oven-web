# Consumer curation automation

Website: https://picorunner.com/
Repository: https://github.com/bigmints/oven-web

The owner switched the public collection to manual curation on 2026-09-23. The former native Hermes job on ubot-server must be paused. The publisher now refuses unattended catalog changes even if that job starts before its scheduler is paused.

- Job: `9b2a3d5230a8` — PicoRunner daily consumer app curation.
- Schedule: every 24 hours, approximately 18:59 Asia/Dubai (14:59 UTC).
- Working directory: `/root/projects/oven-web`.
- Skill: `oven-curator`; continuity enabled to preserve the prior run's summary.
- Delivery: local Hermes job output. No external messages are sent.
- Git access: a deploy key restricted to this repository; private key stays on the server.

The job screens consumer usefulness and supported installation requirements, records exact upstream commits and licenses, and can edit only the catalog and dated curation reports. The publisher rejects out-of-scope files, unreviewed changed listings, an empty catalog, runtime-verification promotion by the Linux curator, and unexpected remote history. Main-branch pushes trigger validation and GitHub Pages deployment.

Linux source research is not proof of a successful macOS PicoRunner installation. The job cannot install or run candidate code, provision services, change website/deployment code, or alter release downloads. Apps requiring unsupported runtimes or consumers to administer infrastructure stay out of the catalog. The public desktop download is still pending a separate release.

## Operations

Run these commands on ubot-server:

```sh
hermes cron runs 9b2a3d5230a8 --limit 5
hermes cron run 9b2a3d5230a8
hermes cron pause 9b2a3d5230a8
hermes cron resume 9b2a3d5230a8
```

The first source-research pass completed and published commit `783854e834d07af07b2a378ff7e3ddbd9ac40a19`, deployed successfully by [Pages run 35451159928](https://github.com/bigmints/oven-web/actions/runs/35451159928). It retained Excalidraw and Actual Budget and added DoHabit. All entries are source-reviewed, not runtime-verified.

That first run exposed a model context limit and recovered through Hermes compaction. Subsequent instructions limit each pass to three candidates, two additions, bounded excerpts and 20 research tool calls. A spot-check then found two inaccurate launch-command descriptions. These were corrected, and publication now checks exact structured recipes and license identification against the pinned upstream sources. Only changed listings require network verification, keeping daily checks bounded as the catalog grows. Scheduled jobs should use the prewritten helpers and native file tools rather than blocked inline-code execution. Review durable run results and the linked Pages action before claiming deployment completion.
