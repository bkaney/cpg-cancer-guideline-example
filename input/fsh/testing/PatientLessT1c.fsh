Instance: Patient1
InstanceOf: Patient
Usage: #inline
* name.family = "Patient1"

Instance: Patient1ObservationTumorSize
InstanceOf: $mcode-tumor-size
Usage: #inline
* status = #final
* category = $observation-category#laboratory
* code = $LOINC#21889-1 "Size Tumor"
* subject = Reference(Patient1)
* performer = Reference(PractitionerShared)
* method = $SCT#787377000 "Gross examination and sampling of tissue specimen (procedure)"
* component[tumorLongestDimension]
  * code = $LOINC#33728-7
  * valueQuantity = 0.1 'cm' "centimeters"

Instance: ExampleCasePatient1
InstanceOf: Bundle
Description: "Patient has < 0.5 cm tumor size"
Usage: #example
* type = #collection
* meta.tag = #test
* insert BundleEntry(Patient, Patient1)
* insert BundleEntry(Practitioner, PractitionerShared)
* insert BundleEntry(Observation, Patient1ObservationTumorSize)