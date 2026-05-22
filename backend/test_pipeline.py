"""Quick smoke-test: POST /api/analyze then stream SSE events until complete."""
import asyncio, httpx, json, time, sys

BASE = "http://localhost:8000"

async def main():
    form = {"profile": "mre", "city": "Berkane", "neighborhood": "Hay Al Massira", "budget": "150-500"}
    t0 = time.time()
    print(f"Submitting: {form['profile']} / {form['city']} / {form['budget']} DH\n")

    async with httpx.AsyncClient(timeout=300.0) as client:
        r = await client.post(f"{BASE}/api/analyze", json=form)
        job_id = r.json()["job_id"]
        print(f"job_id: {job_id}")

        last_event = ""
        async with client.stream("GET", f"{BASE}/api/stream/{job_id}") as stream:
            async for line in stream.aiter_lines():
                if line.startswith("event:"):
                    last_event = line.split(":", 1)[1].strip()
                elif line.startswith("data:"):
                    payload = json.loads(line[5:].strip())
                    elapsed = time.time() - t0

                    if last_event == "agent_start":
                        print(f"\n[{elapsed:.1f}s] AGENT {payload['agent']} START: {payload.get('label','')}")
                        sys.stdout.flush()

                    elif last_event == "agent_done":
                        n = payload["agent"]
                        data = payload["data"]
                        print(f"[{elapsed:.1f}s] AGENT {n} DONE")
                        sys.stdout.flush()
                        if n == 1:
                            loc = data["location"]
                            print(f"  coords : {loc.get('coordinates')}")
                            print(f"  gaps   : {loc['commercial_gaps']}")
                        elif n == 2:
                            d = data["demand"]
                            print(f"  signal : {d.get('demand_signal')}")
                            print(f"  source : {d.get('source','mock')}")
                        elif n == 3:
                            for m in data.get("matches", []):
                                print(f"  {m['score']:3d}  {m['business']}")
                        elif n == 4:
                            for s in data.get("admin_steps", []):
                                print(f"  - {s['step']} ({s['time']})")
                        elif n == 5:
                            top = data.get("scores", {}).get("top_recommendation", {})
                            print(f"  business : {top.get('business')}  score={top.get('score')}")
                            print(f"  verdict  : {top.get('verdict')}")
                            fin = top.get("finance", {})
                            print(f"  invest   : {fin.get('investment')} DH")
                            print(f"  net/mo   : {fin.get('monthlyNet')} DH")
                        sys.stdout.flush()

                    elif last_event == "complete":
                        print(f"\n[{elapsed:.1f}s] PIPELINE COMPLETE -- all 5 agents done")
                        sys.stdout.flush()
                        break

asyncio.run(main())
