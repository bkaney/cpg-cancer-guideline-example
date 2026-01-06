Instance: DoxorubicinOrder
InstanceOf: $cpg-medicationrequestactivity
Usage: #definition
* title = "Order Doxorubicin"
* description = "Doxorubicin Order: Day 1 every 14 days for a cycle length of 4 "
* status = #active
* intent = #proposal
* kind = #MedicationRequest
* doNotPerform = false
* productCodeableConcept = $RXNORM#3639
* timingTiming
  * repeat
    * period = 14
    * periodUnit = #d
    * count = 4

Instance: CyclophosphamideOrder
InstanceOf: $cpg-medicationrequestactivity
Usage: #definition
* title = "Order Cyclophosphamide"
* description = "Cyclophosphamide Order: Day 1 every 14 days for a cycle length of 4 "
* status = #active
* intent = #proposal
* kind = #MedicationRequest
* doNotPerform = false
* productCodeableConcept = $RXNORM#3002
* timingTiming
  * repeat
    * period = 14
    * periodUnit = #d
    * count = 4

Instance: PaclitaxelOrder
InstanceOf: $cpg-medicationrequestactivity
Usage: #definition
* title = "Order Paclitaxel"
* description = "Paclitaxel Order: Day 1 every 14 days for a cycle length of 4 "
* status = #active
* intent = #proposal
* kind = #MedicationRequest
* doNotPerform = false
* productCodeableConcept = $RXNORM#56946
* timingTiming
  * repeat
    * period = 14
    * periodUnit = #d
    * count = 4