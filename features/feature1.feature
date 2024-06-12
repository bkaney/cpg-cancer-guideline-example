Feature: $apply operation
  Scenario: Patient with tumor less than 1.5 cm
    Given 'TNBCNeoadjuvantRecommendation' is loaded
    When apply is called with context 'ExampleCasePatient1'
    Then no activites should have been recommended

  Scenario: Patient with TNBC and tumor over 1.5 cm
    Given 'TNBCNeoadjuvantRecommendation' is loaded
    When apply is called with context 'ExampleCasePatient2'
    Then 'ACfollowedByTRegimen' should have been recommended
    And select "all" of the following should have been recommended
    |DoxorubicinOrder|
    |CyclophosphamideOrder|
    And 'PaclitaxelOrder' should have been recommended