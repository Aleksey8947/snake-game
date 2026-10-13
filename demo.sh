#!/usr/bin/env bash
# Демонстрация погоды без n8n — тот же код, что внутри workflow.
CITY="${1:-Moscow}"
curl -s "https://wttr.in/${CITY}?format=j1" | python3 -c "
import json, sys
d = json.load(sys.stdin)
c = d['current_condition'][0]
a = d['nearest_area'][0]
print(f\"🌍 {a['areaName'][0]['value']}, {a['country'][0]['value']}: \"
      f\"{c['weatherDesc'][0]['value']}, {c['temp_C']}°C \"
      f\"(ощущается {c['FeelsLikeC']}°C), влажность {c['humidity']}%, \"
      f\"ветер {c['windspeedKmph']} км/ч\")"
