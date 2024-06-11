// See: https://www.guidelinecentral.com/guideline/1034358/


Instance: BreastCancerPathway
InstanceOf: $cpg-pathwaydefinition
Usage: #definition
* status = #active
* description = """
Example of a breast cancer pathway definition. All this content is for example
only, and an oversimplification of actual guidance. Here there are few
strategies that would most likely be structured for each line of therapy. 
"""
* action[+]
  * title = "Neoadjuvant Strategy"
  * description = "Neoadjuvant Strategy for Breast Cancer patients"
  * code = $cpg-common-process-cs#guideline-based-care
  * definitionCanonical = Canonical(NeoadjuvantStrategy)
* action[+]
  * title = "Primary Therapy"
  * description = "Primary therapy for Breast Cancer patients (incomplete, for example only)"
  * code = $cpg-common-process-cs#guideline-based-care
* action[+]
  * title = "Adjuvant Strategy"
  * description = "Adjuvant Strategy for Breast Cancer patients (incomplete, for example only)"
  * code = $cpg-common-process-cs#guideline-based-care

Instance: NeoadjuvantStrategy
InstanceOf: $cpg-strategydefinition
Usage: #definition
* status = #active
* description = """
Neoadjuvant chemotherapy is the treatment of choice for patients with
inflammatory breast cancer (IBC) or those with unresectable/locally advanced
disease at presentation whose disease may be rendered resectable with
neoadjuvant treatment.
"""
* action
  * title = "Neoadjuvant Recommendation for TNBC patients"
  * description = """
This is a strategy for neoadjuvant TNBC (triple negative, ER/PR/HER2 negation) patients.
"""
  * code = $cpg-common-process-cs#guideline-based-care
  * definitionCanonical = Canonical(TNBCNeoadjuvantRecommendation)

Instance: TNBCNeoadjuvantRecommendation
InstanceOf: $cpg-strategydefinition // Required for now!
Usage: #definition
* status = #active
* description = """
Patients with TNBC who have clinically node positive and/or at least T1c disease
should be offered an anthracycline- and taxane-containing regimen in the
neoadjuvant setting.
"""
* library = Canonical(GuidelineLogic)
* action[+]
  * title = "TNBC (Triple Negative Breast Cancer)"
  * code = $cpg-common-process-cs#guideline-based-care
  * description = """
Patients with TNBC who have clinically node positive and/or at least T1c disease
should be offered an anthracycline- and taxane-containing regimen in the
neoadjuvant setting.
"""
  * input[+]
    * type = #Observation
    * profile = Canonical(PRStatus)
  * input[+]
    * type = #Observation
    * profile = Canonical(ERStatus)
  * input[+]
    * type = #Observation
    * profile = Canonical(HER2Status)
  * input[+]
    * type = #Observation
    * profile = $mcode-tumor-size
  * input[+]
    * type = #Condition
    * profile = $mcode-primary-cancer-condition
  * condition
    * kind = #applicability
    * expression
      * language = #text/cql-identifier
      * expression = "Has TNBC and at least T1c"
  * definitionCanonical = Canonical(ACfollowedByTRegimen)