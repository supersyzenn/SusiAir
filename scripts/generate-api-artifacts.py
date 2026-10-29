"""The hand-maintained OpenAPI schema is authoritative; this script writes both artifacts.

Postman assertions are maintained here with their originating operation. Run after
contract edits; do not edit the generated JSON files separately.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def obj(properties, required=None):
    return {"type":"object", "properties":properties, "required":required or list(properties)}
def arr(items): return {"type":"array","items":items}
def ref(name): return {"$ref":f"#/components/schemas/{name}"}
string={"type":"string"}
number={"type":"number"}
integer={"type":"integer"}
date={"type":"string","format":"date","pattern":r"^\d{4}-\d{2}-\d{2}$"}
boolean={"type":"boolean"}
schemas={
    "Error":obj({"statusCode":integer,"code":string,"message":{"oneOf":[string,arr(string)]},"path":string}),
    "Login":obj({"username":{"type":"string","minLength":1,"maxLength":100},"password":{"type":"string","minLength":1,"maxLength":200}}),
    "Token":obj({"accessToken":string,"tokenType":{"type":"string","enum":["Bearer"]},"expiresIn":integer}),
    "Pilot":obj({"name":string,"totalFlightHours":number,"avatarUrl":{"type":"string","format":"uri"},"today":date}),
    "FlightDay":obj({"date":date,"hours":number}),
    "DailyHours":obj({"from":date,"to":date,"today":date,"dataStart":{**date,"nullable":True},"dataEnd":{**date,"nullable":True},"days":arr(ref("FlightDay")),"statistics":obj({"totalHours":number,"flyingDays":integer,"averageFlyingDayHours":number})}),
    "LimitCard":obj({"key":{"type":"string","enum":["daily","weekly","monthly","annual"]},"label":string,"hours":number,"limit":number,"windowDays":integer}),
    "Summary":obj({"today":date,"range":{"type":"string","enum":["1w","1m","3m","6m","1y"]},"windowDays":integer,"limit":number,"max":number,"cards":arr(ref("LimitCard")),"series":arr(obj({"date":date,"hours":number,"projected":boolean}))}),
    "Document":obj({"id":string,"label":string,"expiryDate":date,"daysRemaining":integer,"status":{"type":"string","enum":["safe","soon","expired"]}}),
    "Documents":obj({"today":date,"warningDays":integer,"documents":arr(ref("Document"))}),
    "Legend":obj({"code":string,"label":string,"color":{"type":"string","pattern":"^#[0-9a-fA-F]{6}$"}}),
    "Schedule":obj({"id":string,"duty_date":date,"status":integer,"base_name":string,"base_color":string,"duty_type":string,"count_schedules":integer,"count_logbooks":integer}),
    "Schedules":obj({"today":date,"year":integer,"month":integer,"legend":arr(ref("Legend")),"schedules":arr(ref("Schedule"))}),
    "Health":obj({"status":{"type":"string","enum":["ok"]}}),
}
schemas["Login"]["additionalProperties"]=False
def query(name,schema,required=True,description=""):
    return {"in":"query","name":name,"required":required,"schema":schema,"description":description}
def response(name,description):
    return {"description":description,"content":{"application/json":{"schema":ref(name)}}}
def operation(operation_id,summary,schema,parameters=None,public=False):
    op={"operationId":operation_id,"summary":summary,"tags":[operation_id.split('_')[0]],"responses":{"200":response(schema,"Success"),"400":response("Error","Invalid body, unknown parameter, or invalid query range"),"401":response("Error","Missing, invalid or expired bearer token"),"500":response("Error","Unexpected server error")}}
    if parameters: op["parameters"]=parameters
    if public: op["security"]=[]
    return op
login=operation("auth_login","Sign in with the brief's demo pilot account","Token",public=True)
login["requestBody"]={"required":True,"content":{"application/json":{"schema":ref("Login"),"example":{"username":"johndoe","password":"susiairtest"}}}}
paths={
    "/auth/login":{"post":login},
    "/pilot/me":{"get":operation("pilot_me","Return the seeded pilot profile and business date","Pilot")},
    "/flight-hours":{"get":operation("hours_daily","Inclusive daily hours; fill missing days with zero","DailyHours",[query("from",date),query("to",date,description="Must be >= from; inclusive range up to 3660 days")])},
    "/flight-hours/summary":{"get":operation("hours_summary","Server-computed rolling totals and 15-day chart","Summary",[query("range",{"type":"string","enum":["1w","1m","3m","6m","1y"],"default":"1w"},False)])},
    "/documents":{"get":operation("documents_list","Documents with server-derived expiry urgency","Documents")},
    "/schedules":{"get":operation("schedules_month","One month's duties and authoritative legend","Schedules",[query("year",{"type":"string","pattern":"^(19|20|21)[0-9]{2}$"}),query("month",{"type":"string","pattern":"^(0?[1-9]|1[0-2])$"})])},
    "/health":{"get":operation("health_check","Authenticated process health check","Health")},
}
paths["/flight-hours/summary"]["get"]["description"]="Defaults to business date 2026-05-15; inclusive rolling windows end on each series date. Missing days and dates before seed start contribute zero. Future dates include seeded future records and are labeled projected. Cards always end on today. Chart max is a display bound; series values may exceed it."
paths["/documents"]["get"]["description"]="daysRemaining <= 0: expired; 1 through warningDays (30): soon; otherwise safe. Uses APP_TODAY, overriding the conflicting documents seed date."
paths["/flight-hours"]["get"]["description"]="Inclusive range, missing days zero. Metadata provides business date and earliest/latest source dates (null for empty source). Statistics are server-computed across the requested range: total hours, number of positive-hour days, and average per flying day (zero when no flying days). Source data may include future projections; Logbook consumers should cap to today for recorded history. Existing from/to/days fields are preserved."
spec={"openapi":"3.0.3","info":{"title":"Susi Air Pilot API","version":"1.0.0","description":"Read-only pilot operations demo. Login: johndoe / susiairtest. JWT lifetime: 3600 seconds. All date-only business logic defaults to 2026-05-15. Unknown query/body fields are rejected."},"servers":[{"url":"http://localhost:3001"}],"security":[{"bearerAuth":[]}],"paths":paths,"components":{"securitySchemes":{"bearerAuth":{"type":"http","scheme":"bearer","bearerFormat":"JWT"}},"schemas":schemas}}

def event(lines):return [{"listen":"test","script":{"type":"text/javascript","exec":lines}}]
def item(name,path,checks=None,method="GET",body=None,auth=None,status=200):
    req={"method":method,"header":[],"url":"{{baseUrl}}"+path}
    if body is not None:
        req["header"]=[{"key":"Content-Type","value":"application/json"}]
        req["body"]={"mode":"raw","raw":json.dumps(body),"options":{"raw":{"language":"json"}}}
    if auth: req["auth"]=auth
    return {"name":name,"request":req,"event":event([f"pm.test('HTTP {status}', () => pm.response.to.have.status({status}));","const body = pm.response.json();"]+(checks or []))}
items=[item("Login","/auth/login",["pm.test('Token issued', () => pm.expect(body.accessToken).to.be.a('string'));","pm.collectionVariables.set('token', body.accessToken);"],"POST",{"username":"johndoe","password":"susiairtest"},{"type":"noauth"}),
       item("Pilot","/pilot/me",["pm.test('Seeded profile', () => { pm.expect(body.name).to.eql('John Doe'); pm.expect(body.today).to.eql('2026-05-15'); });"]),
       item("Daily flight hours","/flight-hours?from=2026-05-01&to=2026-05-15",["pm.test('Inclusive daily range', () => pm.expect(body.days).to.have.lengthOf(15));","pm.test('Logbook statistics', () => pm.expect(body.statistics).to.eql({totalHours:44,flyingDays:10,averageFlyingDayHours:4.4}));","pm.test('History metadata', () => { pm.expect(body.today).to.eql('2026-05-15'); pm.expect(body.dataStart).to.eql('2024-12-27'); pm.expect(body.dataEnd).to.eql('2026-05-31'); });"])]
for rng,window,limit,max_ in [("1w",7,40,45),("1m",30,100,125),("3m",90,300,325),("6m",180,600,625),("1y",365,1050,1200)]:
    items.append(item(f"Summary {rng}",f"/flight-hours/summary?range={rng}",[
        f"pm.test('Chart bounds', () => {{ pm.expect(body.windowDays).to.eql({window}); pm.expect(body.limit).to.eql({limit}); pm.expect(body.max).to.eql({max_}); }});",
        "pm.test('Today centered', () => { pm.expect(body.series).to.have.lengthOf(15); pm.expect(body.series[7].date).to.eql(body.today); pm.expect(body.series[14].projected).to.eql(true); });",
        "pm.test('Server card totals', () => pm.expect(body.cards.map(c => c.hours)).to.eql([6.4,25.2,87.2,1013.8]));",
    ]))
items.extend([
    item("Documents","/documents",["pm.test('Expiry calculated from May 15', () => { const license=body.documents.find(d=>d.id==='doc_license'); pm.expect(license.daysRemaining).to.eql(14); pm.expect(license.status).to.eql('soon'); });"]),
    item("May schedule","/schedules?year=2026&month=05",["pm.test('Month filtered', () => { pm.expect(body.legend).to.have.lengthOf(10); pm.expect(body.schedules.every(d=>d.duty_date.startsWith('2026-05-'))).to.eql(true); });"]),
    item("Invalid calendar date","/flight-hours?from=2026-02-30&to=2026-03-02",["pm.test('Consistent error', () => pm.expect(body.code).to.eql('BAD_REQUEST'));"],status=400),
    item("Invalid range","/flight-hours/summary?range=2w",status=400),
    item("Missing authentication","/pilot/me",["pm.test('Guard enforced', () => pm.expect(body.code).to.eql('UNAUTHORIZED'));"],auth={"type":"noauth"},status=401),
    item("Bad credentials","/auth/login",["pm.test('Credentials rejected', () => pm.expect(body.code).to.eql('UNAUTHORIZED'));"],method="POST",body={"username":"johndoe","password":"wrong"},auth={"type":"noauth"},status=401),
])
collection={"info":{"name":"Susi Air Pilot API","schema":"https://schema.getpostman.com/json/collection/v2.1.0/collection.json","description":"Generated from api/openapi.json by scripts/generate-api-artifacts.py. Assertions assume APP_TODAY=2026-05-15 and the supplied seeds."},"auth":{"type":"bearer","bearer":[{"key":"token","value":"{{token}}","type":"string"}]},"variable":[{"key":"baseUrl","value":"http://localhost:3001"},{"key":"token","value":""}],"item":items}
for file,content in [("api/openapi.json",spec),("postman/susiair.postman_collection.json",collection)]:
    path=ROOT/file;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(content,indent=2)+"\n")
print(f"Generated OpenAPI ({len(paths)} paths) and Postman ({len(items)} requests)")
