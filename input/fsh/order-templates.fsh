Instance: ACfollowedByTRegimen
InstanceOf: $cpg-computableplandefinition
Usage: #definition
* title = "AC followed by T Regimen"
* description = "Regimen template for AC (Doxorubicin and Cyclophosphamide) followed by T (Paclitaxel)"
* status = #active
* type = #order-set
* action[+]
  * id = "AC"
  * title = "Anthracycline Phase (AC)"
  * relatedAction
    * actionId = "T"
    * relationship = #before
  * selectionBehavior = #all
  * action[+]
    * id = "doxorubicin"
    * title = "Doxorubicin"
    * definitionCanonical = Canonical(DoxorubicinOrder)
  * action[+]
    * id = "cyclophosphamide"
    * title = "Cyclophosphamide"
    * definitionCanonical = Canonical(CyclophosphamideOrder)
* action[+]
  * id = "T"
  * title = "Taxane Phase (T)"
  * relatedAction
    * actionId = "AC"
    * relationship = #after
  * definitionCanonical = Canonical(PaclitaxelOrder)