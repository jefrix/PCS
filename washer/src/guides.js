/* Troubleshooting tables transcribed from the manuals. Links between symptoms replace the manuals' "See ..." references.
   c cause, r remedy, go symptom id, loc 3D node, proc procedure id, p part keys (resolved per machine) */
const TROUBLE = [
 {group:'Pressure and water',sys:'water',items:[
  {id:'lowpressure',t:'Low pressure',pg:'tshootPump2',causes:[
   {c:'Dirty or worn check valves',r:'Clean or replace check valves.',loc:'pump:valves',proc:'valve',p:['valves']},
   {c:'Worn packing',r:'Remove and replace packing.',loc:'pump:packings',proc:'packing',p:['packing']},
   {c:'Belt slipping',r:'Check belt tension. The Belt Tension section the manual points to is not in this PDF.',loc:'belt',p:['belt']},
   {c:'Improperly sized spray tip or nozzle',r:'Fit the spray tip listed in the machine specifications.',loc:'gun:wand',p:['tip']},
   {c:'Inlet filter screen is clogged',r:'Clean inlet filter screen.',loc:'plumb',p:['inletScreen']},
   {c:'Pitted valves',r:'See Valve Service.',loc:'pump:valves',proc:'valve',p:['valves']},
   {c:'Unloader: valve does not reach pressure',r:'Work through the unloader causes.',go:'unlnopress',loc:'unloader:piston'}]},
  {id:'erratic',t:'Erratic pressure, pump runs rough',pg:'tshootPump2',causes:[
   {c:'Dirty or worn check valves',r:'Clean or replace check valves.',loc:'pump:valves',proc:'valve',p:['valves']},
   {c:'Foreign particles in valve assemblies',r:'Clean or replace check valves.',loc:'pump:valves',proc:'valve'},
   {c:'High inlet water temperature',r:'Keep inlet water at or below 165 °F, the pump maximum.',loc:'pump:head'}]},
  {id:'headleak',t:'Water leaking from under the pump head',pg:'tshootPump2',causes:[
   {c:'Worn packing',r:'Install new packing.',loc:'pump:packings',proc:'packing',p:['packing']},
   {c:'Cracked or scored plunger',r:'Remove and replace plunger.',loc:'pump:plungers',proc:'plunger',p:['plunger']},
   {c:'Failure of plunger retainer O-ring',r:'Remove and replace plunger retainer O-ring.',loc:'pump:plungers',proc:'plunger',p:['plungerKit']}]},
  {id:'packingfail',t:'Frequent or early packing failure',pg:'tshootPump2',causes:[
   {c:'Scored, damaged or worn plunger',r:'Remove and replace plungers.',loc:'pump:plungers',proc:'plunger',p:['plunger']},
   {c:'Overpressure to inlet manifold',r:'Reduce inlet pressure. Pump maximum is 125 psi.',loc:'pump:head'},
   {c:'Abrasive material in the fluid',r:'Install proper filtration on the pump inlet.',loc:'plumb',p:['inletScreen']},
   {c:'Excessive pressure or temperature of pumped fluid',r:'Check pressures and inlet temperature are within range.',loc:'pump:head'},
   {c:'Overpressure of pump',r:'Reduce pressure.',loc:'unloader'},
   {c:'Running pump dry',r:'Do not run the pump without water.',loc:'pump:head'}]},
  {id:'checkvalves',t:'Dirty or worn check valves',pg:'tshootPump2',causes:[
   {c:'Normal wear',r:'Remove and replace.',loc:'pump:valves',proc:'valve',p:['valves']},
   {c:'Debris',r:'Check for missing water inlet screens.',loc:'plumb',p:['inletScreen']}]},
  {id:'cavitation',t:'Cavitation or pitted plungers',pg:'tshootPump3',causes:[
   {c:'High inlet fluid temperature, low inlet pressure',r:'Lower inlet fluid temperature and raise inlet fluid pressure.',loc:'pump:plungers'}]},
  {id:'scored',t:'Scored plungers',pg:'tshootPump3',causes:[
   {c:'Abrasive material in fluid being pumped',r:'Install proper filtration on pump inlet plumbing.',loc:'pump:plungers',p:['plunger','inletScreen']}]},
  {id:'vibration',t:'Excessive vibration',pg:'tshootPump3',causes:[
   {c:'Dirty or worn check valves',r:'Follow the check valve causes.',go:'checkvalves',loc:'pump:valves'}]}]},
 {group:'Pump noise and oil',sys:'drive',items:[
  {id:'knock',t:'Loud knocking in pump',pg:'tshootPump',causes:[
   {c:'Loose connecting rod screws',r:'Tighten to the pump spec torque.',loc:'pump:rods'},
   {c:'Worn connecting rod',r:'Replace connecting rod.',loc:'pump:rods',p:['rod']},
   {c:'Worn bearings',r:'Replace bearings.',loc:'pump:bearing',p:['bearing']},
   {c:'Loose plunger bushing screw',r:'Tighten plunger screw to the pump spec torque.',loc:'pump:plungers',proc:'plunger'},
   {c:'Pulley loose on crankshaft',r:'Check key and tighten set screw.',loc:'pumpPulley'},
   {c:'Worn connecting rod, crankshaft or crosshead',r:'Remove and replace.',loc:'pump:crank'}]},
  {id:'shaftoil',t:'Oil leaking around the crankshaft',pg:'tshootPump',causes:[
   {c:'Worn crankshaft seal, bad bearing, grooved shaft, or failed retainer O-ring',r:'Remove and replace.',loc:'pump:seal',p:['crankSeal']}]},
  {id:'rearoil',t:'Oil leaking at the rear of the pump',pg:'tshootPump',causes:[
   {c:'Damaged or badly installed oil gauge window gasket or rear cover',r:'Replace gasket or O-ring.',loc:'pump:rearCover'},
   {c:'Oil gauge loose',r:'Tighten oil gauge.',loc:'pump:sight',p:['sight']},
   {c:'Rear cover screws loose',r:'Tighten rear screws to the spec torque.',loc:'pump:rearCover'},
   {c:'Pump overfilled, oil pushed out of the dipstick breather hole',r:'Drain oil and refill to the recommended level.',loc:'pump:dipstick',proc:'pumpoil',p:['dipstick']}]},
  {id:'crankplay',t:'Excessive play on crankshaft',pg:'tshootPump',causes:[
   {c:'Defective bearings',r:'Follow the worn bearing causes.',go:'bearing',loc:'pump:bearing'},
   {c:'Excess shims',r:'Set up crankshaft.',loc:'pump:crank'}]},
  {id:'waterinoil',t:'Water in crankcase, milky oil',pg:'tshootPump',causes:[
   {c:'Humid air condensing inside',r:'Maintain or step up the oil change schedule. Water must not exceed 20 % of the oil.',loc:'pump:crankcase',proc:'pumpoil'},
   {c:'Worn or damaged plunger screw O-ring',r:'Remove and replace.',loc:'pump:plungers',proc:'plunger',p:['plungerKit']}]},
  {id:'bearing',t:'Worn bearing or short bearing life',pg:'tshootPump',causes:[
   {c:'Excessive belt tension',r:'Check belt tension. The referenced section is not in this PDF.',loc:'belt'},
   {c:'Oil contamination, or oil not changed on schedule',r:'Check oil type and change intervals.',loc:'pump:crankcase',proc:'pumpoil'},
   {c:'Misalignment between pump and motor',r:'Re-align pump and motor.',loc:'pumpPulley'}]},
  {id:'sealife',t:'Short seal life',pg:'tshootPump',causes:[
   {c:'Damaged plunger bushing',r:'Replace plunger bushing.',loc:'pump:oilSeals'},
   {c:'Worn connecting rod',r:'Replace connecting rod.',loc:'pump:rods',p:['rod']},
   {c:'Excess pressure beyond the pump rating',r:'Match the pressure in the pump specifications.',loc:'unloader'},
   {c:'High water temperature',r:'Lower water temperature to the pump specification.',loc:'pump:head'}]},
  {id:'metal',t:'Metal particles during oil change',pg:'tshootPump2',causes:[
   {c:'Failure of an internal component',r:'Remove and disassemble to find the probable cause.',loc:'pump:crankcase'},
   {c:'New pump',r:'New pumps carry machining filings. Drain and refill.',loc:'pump:crankcase',proc:'pumpoil'}]}]},
 {group:'Burner will not fire',sys:'fuel',items:[
  {id:'noignite',t:'Burner will not ignite',pg:'tshootBurner',causes:[
   {c:'Electrodes out of alignment',r:'Set the electrode assembly dimensions.',loc:'burner:electrodes',proc:'electrode',p:['electrodeR','electrodeL']},
   {c:'Electrode insulator failure',r:'Replace if there are breaks, cracks or spark trails.',loc:'burner:electrodes',proc:'gunsvc',p:['insulator']},
   {c:'Water flow switch not closing',r:'Adjust, repair or replace the switch. These machines list pressure switch F04-00790.',loc:'jbox',p:['pressureSw']},
   {c:'Vacuum switch not closing',r:'Adjust, repair or replace the switch.',loc:'jbox'},
   {c:'Temperature control switch not closing',r:'Adjust or replace the temperature control.',loc:'panel',p:['thermostat']},
   {c:'Fuel solenoid valve not opening',r:'Clean, repair or replace solenoid.',loc:'burner:pump',p:['solenoid']},
   {c:'Weak transformer',r:'Clean and check terminals, then run the transformer test.',loc:'burner:igniter',proc:'transformer',p:['igniter']},
   {c:'Faulty cad cell, if equipped',r:'Clean and test cad cell. Replace if required.',loc:'burner:cad',p:['cad']},
   {c:'Faulty primary control, if equipped',r:'Replace primary control.',loc:'burner:box'},
   {c:'Burner motor thermal protector locked out',r:'Follow the thermal protector causes.',go:'thermal',loc:'burner:motor'},
   {c:'Wiring',r:'All contacts clean and tight. No cracked or frayed wire.',loc:'jbox',p:['relay']},
   {c:'Burner switch',r:'Test switch operation. Replace as necessary.',loc:'panel',p:['burnerSw']},
   {c:'Pump pressure',r:'Follow the low fuel pressure causes.',go:'lowfuel',loc:'burner:pump'},
   {c:'Venting or sooting',r:'A downdraft delays ignition. Soot on coil and burner interrupts air flow and can short the electrodes. Clean as required.',loc:'exhaust'},
   {c:'No fuel',r:'Follow the no fuel causes.',go:'nofuel',loc:'fuelTank'}]},
  {id:'noelectric',t:'Burner does not electrically come on',pg:'tshootBurner3',warn:'Do not keep pressing reset when you have oil pressure. You are only filling the combustion chamber with oil, and if it lights it will cause an explosion.',causes:[
   {c:'Burner motor reset button tripped',r:'Reset if necessary, once. Read the warning above.',loc:'burner:motor'},
   {c:'High limit temperature control reset tripped, if equipped',r:'Reset if necessary.',loc:'panel'}]},
  {id:'nofuel',t:'No fuel',pg:'tshootBurner2',causes:[
   {c:'Clogged fuel filter',r:'Replace the element.',loc:'filter',proc:'element',p:['filter']},
   {c:'Fuel leak',r:'Repair as necessary.',loc:'fuelTank'},
   {c:'Kinked or collapsed fuel line',r:'Remove and replace fuel line.',loc:'burner:oilLine',p:['oilLine']},
   {c:'Low fuel pressure',r:'Follow the low fuel pressure causes.',go:'lowfuel',loc:'burner:pump'},
   {c:'Faulty burner oil pump',r:'Adjust pressure or replace.',loc:'burner:pump',proc:'fuelpressure',p:['fuelPump']},
   {c:'Air leak in intake lines',r:'Tighten all fittings.',loc:'burner:oilLine'},
   {c:'Clogged burner nozzle',r:'Remove and replace. Do not clean.',loc:'burner:nozzle',proc:'gunsvc',p:['nozzle']}]},
  {id:'lowfuel',t:'Low fuel pressure (spec 125 psi)',pg:'tshootBurner2',causes:[
   {c:'Clogged fuel filter',r:'Replace the element.',loc:'filter',proc:'element',p:['filter']},
   {c:'Clogged fuel pump filter screen',r:'Remove pump cover and clean strainer with a brush and clean fuel oil, diesel or kerosene.',loc:'burner:pump',proc:'strainer',p:['strainer']},
   {c:'Fuel oil too viscous',r:'Use a lighter oil or operate in a warmer area.',loc:'fuelTank'},
   {c:'Air leaks in intake lines',r:'Tighten all fittings.',loc:'burner:oilLine'},
   {c:'Kinked or collapsed fuel line',r:'Remove and replace.',loc:'burner:oilLine',p:['oilLine']},
   {c:'Burner shaft coupling slipping',r:'Remove and replace.',loc:'burner:coupling',p:['coupling']},
   {c:'Fuel nozzle worn',r:'Replace with the specified nozzle.',loc:'burner:nozzle',proc:'gunsvc',p:['nozzle']},
   {c:'Faulty oil pump',r:'Remove and replace.',loc:'burner:pump',p:['fuelPump']}]},
  {id:'pulsing',t:'Pulsating fuel pressure',pg:'tshootBurner2',causes:[
   {c:'Partially clogged fuel pump strainer or filter',r:'Replace strainer.',loc:'burner:pump',proc:'strainer',p:['strainer']},
   {c:'Air leaking around fuel pump cover',r:'Check cover screws for tightness and the gasket for damage.',loc:'burner:pump',proc:'strainer',p:['strainerCover']}]},
  {id:'thermal',t:'Burner motor thermal protector kicked out',pg:'tshootBurner2',causes:[
   {c:'Low voltage',r:'Voltage must match the burner spec, 12 VDC.',loc:'burner:motor'},
   {c:'Fuel too viscous',r:'Follow the low fuel pressure causes.',go:'lowfuel',loc:'fuelTank'},
   {c:'Fuel pump defective',r:'Check that fuel pump turns freely.',loc:'burner:pump',p:['fuelPump']},
   {c:'Motor defective',r:'Call a service technician or take the motor to a repair or warranty station.',loc:'burner:motor',p:['motor']}]},
  {id:'delayed',t:'Delayed ignition, rumbling or noisy starts',pg:'tshootBurner3',causes:[
   {c:'Dirty or damaged electrodes',r:'Clean or replace.',loc:'burner:electrodes',proc:'gunsvc',p:['electrodeR','electrodeL']},
   {c:'Air adjustment open too far',r:'Readjust the air bands.',loc:'burner:bands',proc:'air',p:['airOuter','airInner']},
   {c:'Poor fuel spray pattern',r:'Replace with the specified nozzle.',loc:'burner:nozzle',proc:'gunsvc',p:['nozzle']},
   {c:'Incorrect electrode setting',r:'Readjust the electrode assembly.',loc:'burner:electrodes',proc:'electrode'},
   {c:'Weak transformer',r:'Run the transformer test.',loc:'burner:igniter',proc:'transformer',p:['igniter']}]}]},
 {group:'Heat, smoke and exhaust',sys:'heat',items:[
  {id:'notemp',t:'Machine will not reach operating temperature',pg:'tshootHeater',causes:[
   {c:'Low fuel pressure',r:'Spec is 125 psi. Follow the low fuel pressure causes.',go:'lowfuel',loc:'burner:pump'},
   {c:'Water in fuel piping',r:'Drain fuel tank and replace the filter.',loc:'filter',proc:'drainwater',p:['filter']},
   {c:'Fuel filter clogged',r:'Replace fuel filter element.',loc:'filter',proc:'element',p:['filter']},
   {c:'Poor combustion',r:'Follow the poor combustion causes.',go:'poorburn',loc:'burner:bands'},
   {c:'Improper fuel supply',r:'Use kerosene, #1 or #2 diesel.',loc:'fuelTank'},
   {c:'Temperature control inoperative, if equipped',r:'Check the temperature control. That insert is not in this PDF.',loc:'panel',p:['thermostat']}]},
  {id:'overheat',t:'Machine overheats',pg:'tshootHeater',causes:[
   {c:'Insufficient water',r:'Follow the low pressure causes.',go:'lowpressure',loc:'plumb'},
   {c:'Temperature control inoperative',r:'Check the temperature control. That insert is not in this PDF.',loc:'panel',p:['thermostat']},
   {c:'Improper fuel supply',r:'Use kerosene, #1 or #2 diesel.',loc:'fuelTank'}]},
  {id:'drysteam',t:'Dry steam, very little moisture',pg:'tshootHeater',causes:[
   {c:'Insufficient water',r:'Follow the low pressure causes.',go:'lowpressure',loc:'plumb'},
   {c:'Improper fuel supply',r:'Use kerosene, #1 or #2 diesel.',loc:'fuelTank'},
   {c:'Improper fuel pressure',r:'Spec is 125 psi.',loc:'burner:pump',proc:'fuelpressure'}]},
  {id:'smoke',t:'Unit smokes, sweet smelling exhaust',pg:'tshootHeater2',causes:[
   {c:'Improper fuel',r:'Refuel with kerosene, #1 or #2 diesel.',loc:'fuelTank'},
   {c:'Insufficient combustion air',r:'Open the air bands to reach #1 or #2 smoke.',loc:'burner:bands',proc:'air',p:['airOuter','airInner']},
   {c:'Leaking fuel system',r:'Correct leakage problem.',loc:'burner:oilLine'},
   {c:'Clogged or improper burner nozzle',r:'Remove and replace. Do not clean.',loc:'burner:nozzle',proc:'gunsvc',p:['nozzle']},
   {c:'Loose burner nozzle',r:'See burner gun service.',loc:'burner:nozzle',proc:'gunsvc'},
   {c:'Water in fuel',r:'Inspect fuel filter for water.',loc:'filter',proc:'drainwater'},
   {c:'Gun out of alignment',r:'Bend oil pipe to center burner nozzle.',loc:'burner:gun',proc:'gunsvc'}]},
  {id:'fumes',t:'Fumes, exhaust burns eyes',pg:'tshootHeater2',causes:[
   {c:'Too much combustion air',r:'Close the air bands to reach #1 or #2 smoke.',loc:'burner:bands',proc:'air'},
   {c:'Improper fuel pressure',r:'Spec is 125 psi.',loc:'burner:pump',proc:'fuelpressure'}]},
  {id:'dripping',t:'Excess oil dripping from coil condensate',pg:'tshootHeater2',causes:[
   {c:'Loose nozzle',r:'See burner gun service.',loc:'burner:nozzle',proc:'gunsvc'},
   {c:'Fuel pressure too high',r:'Adjust to 125 psi.',loc:'burner:pump',proc:'fuelpressure'},
   {c:'Burner nozzle defective',r:'Replace with the specified nozzle.',loc:'burner:nozzle',proc:'gunsvc',p:['nozzle']},
   {c:'Incorrect burner nozzle',r:'Replace with the specified nozzle.',loc:'burner:nozzle',proc:'gunsvc',p:['nozzle']}]},
  {id:'poorburn',t:'Poor combustion',pg:'tshootHeater2',causes:[
   {c:'Low fuel pressure',r:'Follow the low fuel pressure causes.',go:'lowfuel',loc:'burner:pump'},
   {c:'Improper fuel supply',r:'Use kerosene, #1 or #2 diesel.',loc:'fuelTank'},
   {c:'Insufficient combustion air',r:'Adjust the air bands.',loc:'burner:bands',proc:'air'}]}]},
 {group:'Unloader',sys:'water',only:'5355J',note:'Printed in the 5355J manual for valve C07-04506.',items:[
  {id:'unlcycle',t:'Unloader recycles frequently',pg:'unloaderTrouble',causes:[
   {c:'Damaged check valve O-ring',r:'Remove and replace.',loc:'unloader:check',p:['unloaderKit']},
   {c:'Leaking connections',r:'Check or renew.',loc:'hoses'},
   {c:'Restricted bypass or bypass hose too small',r:'Clean or adapt passage diameter.',loc:'unloader:outlet'}]},
  {id:'unlnopress',t:'Valve does not reach pressure',pg:'unloaderTrouble',causes:[
   {c:'Piston O-rings worn out',r:'Remove and replace.',loc:'unloader:piston',p:['unloaderKit']},
   {c:'Debris between seat and shutter',r:'Clean the seat.',loc:'unloader:seat'},
   {c:'Seat worn out',r:'Remove and replace.',loc:'unloader:seat',p:['unloaderKit']},
   {c:'Nozzle worn out',r:'Remove and replace.',loc:'gun:wand',p:['tip']},
   {c:'Incorrect choice of nozzle',r:'Fit a smaller nozzle.',loc:'gun:wand',p:['tip']}]},
  {id:'unlpeak',t:'High pressure peaks at gun closure',pg:'unloaderTrouble',causes:[
   {c:'Less than 5 % of total flow discharged in bypass',r:'Reset correctly.',loc:'unloader:body',proc:'unloaderadj'},
   {c:'Excessive flow in bypass',r:'Change type of valve or adjust passages.',loc:'unloader:outlet'},
   {c:'Adjustment spring totally compressed',r:'Loosen adjustment screw and, if needed, fit a smaller nozzle.',loc:'unloader:spring'}]},
  {id:'unlnodump',t:'Valve does not discharge at low pressure at gun closure',pg:'unloaderTrouble',causes:[
   {c:'Jammed check valve',r:'Clean or replace.',loc:'unloader:check'},
   {c:'Debris on check valve',r:'Clean.',loc:'unloader:check'}]}]},
 {group:'Fuel filter',sys:'fuel',items:[
  {id:'bowlleak',t:'Fuel bowl leaking',pg:'filterMaint',causes:[
   {c:'Deteriorated gasket',r:'Remove and replace gasket.',loc:'filter',p:['bowlKit']},
   {c:'Housing cracked',r:'Remove and replace housing.',loc:'filter'},
   {c:'Bowl rim cracked, nicked or scratched',r:'Remove and replace bowl.',loc:'filter',p:['bowlKit']},
   {c:'Gasket missing',r:'Replace gasket.',loc:'filter'},
   {c:'Loose fuel bowl',r:'Tighten fuel bowl onto filter.',loc:'filter'}]},
  {id:'airbubbles',t:'Air bubbles in the bowl during operation',pg:'filterMaint',causes:[
   {c:'Cracked component',r:'Inspect filter bowl, filter housing and gasket.',loc:'filter'},
   {c:'Loose filter bowl',r:'Tighten fuel bowl onto fuel filter.',loc:'filter'},
   {c:'Loose valve assembly',r:'Tighten valve assembly.',loc:'filter'}]}]}
];

const PROCS = {
 pumpoil:{t:'Change pump oil',pg:'head',only8405text:true,loc:'pump:crankcase',lead:'Change the oil with the pump stopped and the oil still warm.',steps:['Stop the pump while the oil is still warm.','Drain the crankcase through the oil drain hose.','Refill with pump oil to the sight level. Capacity: 40.6 oz on 5355J, 31.0 oz on 8405HNL.','Check the drained oil. Milky oil means water. Water must stay under 20 %. Metal particles need investigating unless the pump is new.'],warn:''},
 valve:{t:'Valve service',pg:'pumpMaint',loc:'pump:valves',steps:['Remove the plugs holding the valve assemblies.','Remove and discard the O-rings from the plugs. Clean plugs with solvent or soap and water. Let them dry.','Remove the valve assemblies from the head with needle-nose pliers, fingers or a hook tool. Discard their O-rings. Examine each assembly.','Clean debris from the valve cavities and flush with water.','Wash the assemblies in clean water and rinse. While still wet, test each by sucking on the valve seat. A good valve holds vacuum.','Replace any valve that fails.','Lubricate a new O-ring with crankcase oil and install it in the cavity. Install a good valve assembly.','Lubricate a new O-ring and place it on a cleaned plug.','Install the plug and tighten by hand.','Torque the plug to the pump spec value.','Repeat for the remaining valves.']},
 headoff:{t:'Remove pump head',pg:'pumpMaint',loc:'pump:head',steps:['Remove the cap screws holding the head to the crankcase. This needs a metric tool. Keep the washer on each screw.','Rotate the crankshaft and tap the head away with a soft mallet. Keep the rear of the head parallel to the crankcase so it does not bind on the plungers.','Protect the plungers from damage once the head is off.']},
 plunger:{t:'Plunger service',pg:'plunger',loc:'pump:plungers',lead:'Fit a new O-ring, anti-extrusion ring and copper washers any time the plunger screw comes out.',steps:['Remove the pump head.','Pull any packings and retainers straight off the plungers.','Check each plunger for scoring, cracks or pitting. Continue only for a defective plunger.','Remove the retaining screw counterclockwise. Replace the copper washer.','Discard the O-ring and anti-extrusion ring from the retainer screw.','Remove the plunger from the crosshead.','Remove and discard the copper flinger washer. Clean with solvent and let dry.','Install the copper flinger washer on the crosshead and slide the plunger on.','Lubricate an O-ring and fit it in the screw groove, nearest the screw head. Fit the anti-extrusion ring next to it, nearest the threads.','Put a drop of thread sealant on the retainer screw threads.','Thread in the screw with the copper flat washer in place.','Torque to the pump spec value, then reinstall the head.']},
 packing:{t:'Packing service',pg:'packing',loc:'pump:packings',steps:['Remove the pump head.','Pull packings and female adapters straight off the plungers. Use the packing extractor on what stays in the head. Discard O-rings and packings.','Clean the packing cavities and rinse with clean water.','Clean the plungers. Clean the adapters with soap and water and let dry.','Examine adapters and discard worn ones. Trial fit the female adapters in the head and check for binding.','Lubricate cavities, packings and adapters with crankcase oil.','Lay the head on the bench, cavities up. Install one male adapter in each cavity, flat side down.','Install one V-packing in each cavity, lips down.','Install the re-stop ring, lips down.','Install a front female adapter, flat side up, fully seated.','Install the low pressure packing, flat side down.','Install the rear female adapter, lips down.','Lubricate O-rings and install one in the groove of each adapter.','Install the adapter and O-ring, flat side up. It should push to about 1/16 in of flush by hand. If it does not, remove and reinstall the stack.','Install the head.']},
 headon:{t:'Install pump head',pg:'head',loc:'pump:bolts',steps:['Prepare the head per packing service.','Rotate the plungers so the outer two project the same distance.','Lubricate the exposed plungers with crankcase oil.','Start the head onto the plungers and tap evenly with a soft mallet until it meets the crankcase.','Start the cap screws with a lock washer on each.','Tighten all screws by hand.','Torque the screws to spec in the order printed in the manual.']},
 freeze:{t:'Freeze protection and storage',pg:'head',loc:'pump:head',steps:['Drain all water out of the pump.','Run a 50 % solution of RV or non-toxic, biodegradable antifreeze through the pump.','Flush with fresh water before the next use.'],warn:'In freezing conditions, skipping this can damage the pump internally. Freeze damage is excluded from warranty. For long storage in non-freezing areas, the solution keeps seals and O-rings lubricated.'},
 air:{t:'Air band adjustment',pg:'air',loc:'burner:bands',lead:'Preset at the factory for about 1,400 ft elevation. Readjust where elevation is substantially different. The 8405HNL spec is 2 1/4 in open.',steps:['Loosen the cap screw retaining the air bands.','With the machine running, move the bands until the exhaust gives #1 or #2 on the Bacharach smoke scale. Without a tester: smoky exhaust, oily odor or sweet smell means too little air. Eye-burning fumes mean too much.','Tighten the cap screw.']},
 strainer:{t:'Fuel pump strainer',pg:'air',loc:'burner:pump',steps:['Shut off fuel supply.','Loosen the 4 screws holding the cover to the pump housing.','Take off cover and gasket, and pull the strainer off the housing.','Clean out dirt from the bottom of the strainer cover. If you see rust, remove water from the supply tank and fuel filter.','Turn the fuel supply back on.'],warn:'Failing to turn the fuel supply back on damages the fuel pump.'},
 fuelpressure:{t:'Fuel pressure adjustment',pg:'air',loc:'burner:pump',lead:'Spec is 125 psi on both machines.',steps:['Install a 0-200 psi gauge.','Remove the plug on top of the fuel pump.','Insert a 1/8 in Allen wrench. Clockwise increases pressure, counterclockwise decreases.','Remove the gauge and reinstall the plug.']},
 blower:{t:'Blower fan replacement',pg:'blower',loc:'burner:fan',steps:['Shut off power to the burner and disconnect wires.','Loosen the two screws securing the blower motor and fan to the housing.','Remove the blower.','Install the blower on the shaft. Place a .030 feeler gauge on the motor and slide the blower until it touches. Rotate the wheel until the set screw is centered on the shaft flat, then tighten.','Reinstall motor and blower.','Reconnect wires and turn on power.']},
 transformer:{t:'Transformer test',pg:'blower',loc:'burner:igniter',warn:'High voltage. Use a screwdriver with a well insulated handle.',steps:['Remove the burner junction box cover.','Turn on the burner and confirm the transformer receives rated voltage.','Turn off the burner.','Loosen the screw and swing the transformer away from the burner gun.','Turn on the burner.','Short the high voltage terminals with the screwdriver.','Open the gap by drawing the screwdriver away from one electrode while touching the other.','The spark should jump 5/8 to 3/4 in. If it does not jump, replace the transformer.','Turn the burner off.','Partially close the transformer and check the buss bars align and make contact.','Close the transformer, reposition the clip and tighten the screw.']},
 buss:{t:'Buss bar alignment',pg:'blower',loc:'burner:electrodes',steps:['With the burner off, loosen the screw and swing the transformer away.','Inspect buss bars and transformer electrodes for pitting or corrosion.','Partially close the transformer and check contact and alignment.','Gently bend the buss bars until they spring against, parallel to and in full contact with the transformer electrodes.','Carefully close and fasten the transformer.']},
 gunsvc:{t:'Burner gun removal and service',pg:'gun',loc:'burner:gun',steps:['Disconnect the fuel line from the gun oil line fitting. Loosen the other end and swing the line away.','Remove the retaining nut.','Loosen the screw and swing the transformer away.','Carefully remove the gun.','Replace cracked electrode insulators. Clean burnt buss bars. Clean carbon off the electrodes.','Clean carbon off the nozzle without scratching the face or orifice. Check for a loose nozzle.','Gently replace the gun in the air tube. Do not force it, or the electrodes misalign.','Reinstall the retaining nut and oil line. Make both ends tight.','Partially close the transformer and check buss bar contact.','Close the transformer, reposition the retainer and tighten the screw.']},
 electrode:{t:'Electrode adjustment',pg:'gun',loc:'burner:electrodes',spec:[['Above nozzle face','5/32 in'],['From nozzle center','5/16 in'],['Tip gap','1/8 in']],steps:['Loosen the screws holding the electrode assemblies.','Raise the tips 5/32 in above the end of the oil nozzle.','Place each tip 5/16 in from the center of the spray hole, keeping the first measurement.','Spread the tips to a 1/8 in gap, keeping both measurements.','Gently tighten the screws.'],warn:'Do not overtighten. It makes the electrode insulator fail.'},
 prime:{t:'Prime the fuel filter',pg:'filter',loc:'filter',steps:['Shut off the fuel tank valves.','Spin off the clear bowl, fill with clean fuel and coat the round gasket with fuel.','Reinstall the bowl. Tighten 1/4 to 1/3 turn after the gasket contacts the upper housing.','Turn on the fuel tank valves. Start the machine and check for leaks.']},
 drainwater:{t:'Drain water from the fuel filter',pg:'filter',loc:'filter',steps:['Check the collection bowl daily.','Drain off water by unscrewing the clear bowl counterclockwise, or by opening the head vent and then the drain.','If you drain more than 1/8 cup, follow the priming steps. Otherwise close the vent and drain.','Start the machine and let air purge from the fuel system before operating.']},
 element:{t:'Replace fuel filter element',pg:'filter',loc:'filter',lead:'Replace every 500 hours, or on engine power loss, whichever comes first. Foul-smelling diesel means microbes: change fuel source and carry a spare element.',steps:['Shut off the fuel tank valves.','Unscrew the clear bowl counterclockwise.','Remove and discard the element.','Follow the priming steps.']},
 unloaderadj:{t:'Unloader adjustment',pg:'unloaderAdjust',loc:'unloader:nuts',warn:'Preset at the factory. Adjust only after repair or replacement. The lower nut (item 21) is a mechanical safety that limits pressure. It must not be removed. Always keep a relief valve in the system.',steps:['Install a pressure gauge in the pump head outlet. Its range should be twice the operating pressure.','Install the spray nozzle in the end of the wand.','Make sure the relief valve is set properly.','Loosen the top lock nut and turn the lower nut counterclockwise to minimum spring tension.','Machine on, trigger open: start the pump and watch the gauge. Slowly loosen the lower nut until pressure starts to drop.','Tighten the lower nut. Pressure should rise. Tighten until it stops climbing.','Close and open the gun to check unloading pressure and bypass. Unloading pressure should not exceed operating pressure by more than 400 psi.','Lock the setting with the top lock nut.']},
 gunrepair:{t:'Trigger gun repair',pg:null,pgFixed:9,loc:'gun:seat',steps:['Remove the screws from the handles and remove the housings.','With an 18 mm socket, remove the retainer. Catch the spring and ball as they fall out.','Replace parts with those in kit J06-99158C. Bevel side of the washer and dished side both face the ball.','Reassemble in reverse order.'],warn:'Do not run acid concentrates through the gun. Never hold the trigger open by anything but the operator’s hand. Engage the safety latch when not in use.'}
};

/* every: hours; days: calendar. Source: m manual / g gap */
const SCHEDULE = [
 {group:'Every day',items:[{id:'bowl',t:'Check fuel filter bowl and drain water',days:1,proc:'drainwater',src:'filter',loc:'filter'}]},
 {group:'Every week',items:[
  {id:'gasket',t:'Inspect fuel filter gaskets for tearing',days:7,src:'filterMaint',loc:'filter'},
  {id:'rim',t:'Inspect filter bowl rim for nicks, cracks, scratches',days:7,src:'filterMaint',loc:'filter'},
  {id:'eleminspect',t:'Inspect filter element for damage',days:7,src:'filterMaint',loc:'filter'},
  {id:'bowlclean',t:'Check fuel bowl for contaminants. Check more often if found',days:7,src:'filterMaint',loc:'filter'}]},
 {group:'By hour meter',items:[
  {id:'oilfirst',t:'First pump oil change',at:50,proc:'pumpoil',src:'head',loc:'pump:crankcase',note:{'5355J':'Interval borrowed from the 8405HNL manual. The 5355J manual prints none.'}},
  {id:'oil',t:'Pump oil change',every:300,orDays:90,proc:'pumpoil',src:'head',loc:'pump:crankcase',note:{'5355J':'Interval borrowed from the 8405HNL manual. The 5355J manual prints none.'}},
  {id:'gasketr',t:'Replace fuel filter gaskets',every:100,src:'filterMaint',loc:'filter'},
  {id:'unlgrease',t:'Check unloader seals and lube with water-resistant grease',every:400,only:'5355J',src:'unloaderParts',loc:'unloader:piston'},
  {id:'element',t:'Replace fuel filter element',every:500,proc:'element',src:'filter',loc:'filter'}]},
 {group:'Every year',items:[{id:'relief',t:'Inspect relief valve for obstruction',days:365,src:'unloader',loc:'relief'}]},
 {group:'When the condition calls for it',items:[
  {id:'descale',t:'Descale the coil at 50 psi back pressure. A new coil reads 5 psi',cond:true,src:null,pgFixed:{'5355J':5,'8405HNL':5},loc:'coilTube'},
  {id:'smoke',t:'Check smoke: #1 or #2 Bacharach. Set air bands if off',cond:true,proc:'air',src:'air',loc:'burner:bands'},
  {id:'fuelpsi',t:'Check burner fuel pressure: 125 psi',cond:true,proc:'fuelpressure',src:'air',loc:'burner:pump'},
  {id:'freeze',t:'Freeze protect before freezing weather or long storage',cond:true,proc:'freeze',src:'head',loc:'pump:head'},
  {id:'engine',t:'Engine oil, air filter and oil filter',cond:true,src:null,pgFixed:{'5355J':6,'8405HNL':7},loc:'engine',note:{'5355J':'Part numbers only. Use the Honda GX630 owner’s manual for intervals.','8405HNL':'Part numbers only. Use the Honda GX800 owner’s manual for intervals.'}},
  {id:'belt',t:'Belt tension',cond:true,src:null,loc:'belt',note:{'5355J':'The manual cites a Belt Tension section that is not in the PDF. Ask Alkota for the spec.','8405HNL':'The manual cites a Belt Tension section that is not in the PDF. Ask Alkota for the spec.'}}]}
];
const PROC_GROUPS=[['Pump',['pumpoil','valve','headoff','plunger','packing','headon','freeze']],['Burner',['air','strainer','fuelpressure','blower','transformer','buss','gunsvc','electrode']],['Fuel filter',['prime','drainwater','element']],['Unloader and gun',['unloaderadj','gunrepair']]];
const SAFETY=['Shut the engine off and let the coil and exhaust cool.','Squeeze the trigger with the engine off to bleed pressure before opening any fitting.','Disconnect the battery before electrical or burner work, except where a test needs power.','Shut off the fuel tank valves before opening the fuel system.'];
