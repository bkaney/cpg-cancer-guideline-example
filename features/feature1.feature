Feature: $apply operation
  Scenario: Check for recommentation
    Given 'TNBCNeoadjuvantRecommendation' is loaded
    When apply is called with context 'ExampleCasePatient1'
    Then "ReportOver18" should have been recommended
    And select "at-most-one" of the following should have been recommended
    | OrderMedication1 |
    | OrderMedication2 |