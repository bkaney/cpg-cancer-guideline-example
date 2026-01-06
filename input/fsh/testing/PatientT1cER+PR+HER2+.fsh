Instance: Patient2
InstanceOf: $us-core-patient
Usage: #inline
* identifier
  * use = #usual
  * type = $v2-0203#MR "Medical Record Number"
    * text = "Medical Record Number"
  * system = "http://hospital.smarthealthit.org"
  * value = "1032702"
* gender = #female
* name
  * family = "Patient2"

Instance: Patient2Condition
InstanceOf: $mcode-primary-cancer-condition
Usage: #inline
* clinicalStatus = $condition-clinical#active
* verificationStatus = $condition-ver-status#confirmed
* category = $condition-category#problem-list-item
* code = $ICD10CM#C50.011 "Malignant neoplasm of nipple and areola, right female breast"
* subject = Reference(Patient2)
//* stage.summary = $sct#1222806003 "American Joint Committee on Cancer stage IIIC (qualifier value)"
//* stage.assessment = Reference(Observation/tnm-clinical-stage-group-jenny-m)
//* stage.type = $sct#897275008 "American Joint Commission on Cancer, Cancer Staging Manual, 8th edition neoplasm staging system (tumor staging)"


Instance: Patient2ObservationTumorSize
InstanceOf: $mcode-tumor-size
Usage: #inline
* status = #final
* category = $observation-category#laboratory
* code = $LOINC#21889-1 "Size Tumor"
* subject = Reference(Patient2)
* performer = Reference(PractitionerShared)
* method = $SCT#787377000 "Gross examination and sampling of tissue specimen (procedure)"
* component[tumorLongestDimension]
  * code = $LOINC#33728-7
  * valueQuantity = 1.5 'cm' "centimeters"

Instance: Patient2ObservationERNegative
InstanceOf: ERStatus
Usage: #inline
* status = #final
* category[us-core] = $observation-category#laboratory
* code = $LOINC#85337-4 "Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain"
* subject = Reference(Patient2)
* performer = Reference(PractitionerShared)
* valueCodeableConcept = $LOINC#LA6577-6 "Negative"

Instance: Patient2ObservationPRNegative
InstanceOf: PRStatus
Usage: #inline
* status = #final
* category[us-core] = $observation-category#laboratory
* code = $LOINC#85339-0 "Progesterone receptor Ag [Presence] in Breast cancer specimen by Immune stain"
* subject = Reference(Patient2)
* performer = Reference(PractitionerShared)
* valueCodeableConcept = $LOINC#LA6577-6 "Negative"

Instance: Patient2ObservationHER2Negative
InstanceOf: HER2Status
Usage: #inline
* status = #final
* category[us-core] = $observation-category#laboratory
* code = $LOINC#48676-1 "HER2 [Interpretation] in Tissue"
* subject = Reference(Patient2)
* performer = Reference(PractitionerShared)
* valueCodeableConcept = $LOINC#LA6577-6 "Negative"

Instance: ExampleCasePatient2
InstanceOf: Bundle
Description: "Patient has 1.5 cm tumor size, ER/PR/HER2 positive"
Usage: #example
* type = #collection
* meta.tag = #test
* insert BundleEntry(Patient, Patient2)
* insert BundleEntry(Practitioner, PractitionerShared)
* insert BundleEntry(Condition, Patient2Condition)
* insert BundleEntry(Observation, Patient2ObservationTumorSize)
* insert BundleEntry(Observation, Patient2ObservationERNegative)
* insert BundleEntry(Observation, Patient2ObservationPRNegative)
* insert BundleEntry(Observation, Patient2ObservationHER2Negative)