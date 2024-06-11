"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cucumber_1 = require("@cucumber/cucumber");
const helpers_1 = require("./helpers");
dotenv_1.default.config();
const { CONTENT_ENDPOINT, TERMINOLOGY_ENDPOINT, DATA_ENDPOINT, CPG_ENDPOINT } = process.env;
const DEFAULT_SERVER = 'http://127.0.0.1:9001'; // Default server is cds-service localhost 9001
const filePath = path_1.default.join(process.cwd(), 'output');
const DEFAULT_ENDPOINT = `file://${filePath}`; // Default endpoint assumes package is being used at root of IG with an output package
const contentEndpointAddress = CONTENT_ENDPOINT !== null && CONTENT_ENDPOINT !== void 0 ? CONTENT_ENDPOINT : DEFAULT_ENDPOINT;
const terminologyEndpointAddress = (_a = TERMINOLOGY_ENDPOINT !== null && TERMINOLOGY_ENDPOINT !== void 0 ? TERMINOLOGY_ENDPOINT : CONTENT_ENDPOINT) !== null && _a !== void 0 ? _a : DEFAULT_ENDPOINT;
const dataEndpoint = DATA_ENDPOINT !== null && DATA_ENDPOINT !== void 0 ? DATA_ENDPOINT : DEFAULT_ENDPOINT;
const cpgServerAddress = CPG_ENDPOINT !== null && CPG_ENDPOINT !== void 0 ? CPG_ENDPOINT : DEFAULT_SERVER;
(0, cucumber_1.Given)('{string} is loaded', function (planDefinitionIdentifier) {
    return __awaiter(this, void 0, void 0, function* () {
        const [id, version] = planDefinitionIdentifier.split('|');
        let planDefinition = yield (0, helpers_1.resolveReference)(id, 'PlanDefinition', contentEndpointAddress, version);
        if (!planDefinition) {
            throw new Error('Unable to resolve plan definition');
        }
        else if (planDefinition.resourceType !== 'PlanDefinition') {
            throw new Error('Resource does not seem to be a FHIR Plan Definition');
        }
        this.planDefinition = planDefinition;
    });
});
(0, cucumber_1.When)('apply is called with context {string}', { timeout: 3 * 5000 }, function (patientContextIdentifier) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        this.patientContextIdentifier = patientContextIdentifier;
        const reference = `Bundle/${patientContextIdentifier}`;
        const patientContext = yield (0, helpers_1.resolveReference)(patientContextIdentifier, 'Bundle', dataEndpoint);
        const contentEndpoint = (0, helpers_1.createEndpoint)('content', contentEndpointAddress);
        const terminologyEndpoint = (0, helpers_1.createEndpoint)('terminology', terminologyEndpointAddress);
        const body = {
            resourceType: 'Parameters',
            parameter: [
                {
                    name: 'planDefinition',
                    resource: this.planDefinition,
                },
                {
                    name: 'data',
                    resource: patientContext,
                },
                {
                    name: 'contentEndpoint',
                    resource: contentEndpoint,
                },
                {
                    name: 'terminologyEndpoint',
                    resource: terminologyEndpoint,
                },
            ],
        };
        let cpgEndpoint = cpgServerAddress;
        if (cpgEndpoint.startsWith('http://localhost')) {
            cpgEndpoint = cpgEndpoint.replace('http://localhost', 'http://127.0.0.1');
        }
        try {
            const response = yield fetch(`${cpgEndpoint}/PlanDefinition/$apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            this.cpgResponse = yield response.json();
            if (!response.ok) {
                throw response;
            }
        }
        catch (e) {
            console.log(e);
        }
        // Create list of recomendations. Each asserted recommendation will be removed from the list. After all assertions, this array should be empty.
        this.recommendations = (_b = (_a = this.cpgResponse) === null || _a === void 0 ? void 0 : _a.entry) === null || _b === void 0 ? void 0 : _b.map((entry) => {
            const canonical = helpers_1.is.RequestResource(entry.resource)
                ? (0, helpers_1.getInstantiatesCanonical)(entry.resource)
                : undefined;
            return canonical && canonical != this.planDefinition.url
                ? canonical.split('/').pop()
                : null;
        }).filter(helpers_1.notEmpty);
        // Create list of selection groups. Used for test failure logging.
        const findSelectionMatchs = (action) => {
            let definitions;
            action.forEach((action) => {
                const selectionCode = action.selectionBehavior;
                if (selectionCode && action.action) {
                    definitions = action.action.map(a => {
                        var _a;
                        const request = (0, helpers_1.resolveRequestResource)(a, this.cpgResponse);
                        return request ? (_a = (0, helpers_1.getInstantiatesCanonical)(request)) === null || _a === void 0 ? void 0 : _a.split('/').pop() : null;
                    }).filter(helpers_1.notEmpty);
                    definitions.length ? (this.selectionGroups || (this.selectionGroups = [])).push({ selectionCode, definitions }) : null;
                }
                if (action.action) {
                    findSelectionMatchs(action.action);
                }
            });
        };
        (_d = (_c = this.cpgResponse) === null || _c === void 0 ? void 0 : _c.entry) === null || _d === void 0 ? void 0 : _d.forEach((entry) => {
            if (helpers_1.is.RequestGroup(entry.resource) && entry.resource.action) {
                findSelectionMatchs(entry.resource.action);
            }
        });
    });
});
(0, cucumber_1.Then)('{string} should have been recommended', function (activityDefinitionIdentifier) {
    var _a, _b, _c;
    const instantiatedResource = (_b = (_a = this.cpgResponse) === null || _a === void 0 ? void 0 : _a.entry) === null || _b === void 0 ? void 0 : _b.find((entry) => {
        // Custom type RequestResource does not currently include communication request because CPG v1.0 excludes instantiates canonical from this resource. v2.0 will include instantiates canonical, so the server should be updated.
        const resource = entry.resource;
        const instantiatesCanonical = (0, helpers_1.getInstantiatesCanonical)(resource);
        const isMatch = (instantiatesCanonical === null || instantiatesCanonical === void 0 ? void 0 : instantiatesCanonical.split('/').pop()) === activityDefinitionIdentifier;
        isMatch
            ? (this.recommendations = (0, helpers_1.removeFromRecommendations)(instantiatesCanonical.split('/').pop(), this.recommendations))
            : null;
        return isMatch;
    });
    (0, assert_1.default)(instantiatedResource, `\nExpected recommendation:\n- ${activityDefinitionIdentifier}\nBut found:\n- ${(0, helpers_1.isEmpty)(this.recommendations)
        ? '- No remaining recommendations'
        : (_c = this.recommendations) === null || _c === void 0 ? void 0 : _c.join('\n- ')}`);
});
(0, cucumber_1.Then)('select {string} of the following should have been recommended', function (selectionBehaviorCode, selectionDefinitionIdentifiersTable) {
    var _a, _b;
    const selectionDefinitionIdentifiers = selectionDefinitionIdentifiersTable
        .raw()
        .map((i) => i[0])
        .sort();
    const findSelectionMatch = (action) => {
        let isMatch = false;
        for (let i = 0; i < action.length && !isMatch; i++) {
            let subAction = action[i];
            if (subAction.selectionBehavior &&
                subAction.selectionBehavior === selectionBehaviorCode &&
                subAction.action) {
                isMatch = isCanonicalMatch(subAction.action, selectionBehaviorCode);
            }
            if (!isMatch && subAction.action) {
                isMatch = findSelectionMatch(subAction.action);
            }
            else {
            }
        }
        return isMatch;
    };
    const isCanonicalMatch = (selectionGroupAction, selectionBehaviorCode) => {
        let isMatch = false;
        const selectionGroupDefinitions = selectionGroupAction
            .map((subAction) => {
            const resource = (0, helpers_1.resolveRequestResource)(subAction, this.cpgResponse);
            const canonical = helpers_1.is.RequestResource(resource)
                ? (0, helpers_1.getInstantiatesCanonical)(resource)
                : undefined;
            return canonical ? canonical.split('/').pop() : null;
        })
            .filter(helpers_1.notEmpty);
        isMatch =
            selectionGroupDefinitions.sort().toString() ===
                selectionDefinitionIdentifiers.sort().toString();
        if (selectionGroupDefinitions.length == 0) {
            const selectionGroupTitles = selectionGroupAction
                .map((subAction) => {
                return subAction.title;
            })
                .filter(helpers_1.notEmpty);
            isMatch =
                selectionGroupTitles.sort().toString() ===
                    selectionDefinitionIdentifiers.sort().toString();
        }
        if (isMatch) {
            selectionGroupDefinitions.forEach((id) => {
                this.recommendations = (0, helpers_1.removeFromRecommendations)(id, this.recommendations);
            });
            this.selectionGroups = (0, helpers_1.removeFromSelectionGroups)(selectionBehaviorCode, selectionGroupDefinitions, this.selectionGroups);
        }
        return isMatch;
    };
    let isMatch = false;
    if ((_a = this.cpgResponse) === null || _a === void 0 ? void 0 : _a.entry) {
        for (let i = 0; i < this.cpgResponse.entry.length && !isMatch; i++) {
            const resource = this.cpgResponse.entry[i]
                .resource;
            isMatch = resource.action ? findSelectionMatch(resource.action) : false;
        }
    }
    const message = `\nExpected:\n - Select ${selectionBehaviorCode}: ${selectionDefinitionIdentifiers.join(', ')}\nBut found:\n ${(0, helpers_1.isEmpty)(this.selectionGroups)
        ? '- No remaining selection groups'
        : (_b = this.selectionGroups) === null || _b === void 0 ? void 0 : _b.map(sg => `- Select ${sg.selectionCode}: ${sg.definitions.join(', ')}\n`)}`;
    (0, assert_1.default)(isMatch, message);
});
(0, cucumber_1.Then)('select {string} of the following actions should be present', function (selectionBehaviorCode, selectionActionIdentifiersTable) {
    var _a;
    const selectionActionIdentifiers = selectionActionIdentifiersTable
        .raw()
        .map((i) => i[0])
        .sort();
    const findSelectionMatch = (action) => {
        let isMatch = false;
        for (let i = 0; i < action.length && !isMatch; i++) {
            let subAction = action[i];
            if (subAction.selectionBehavior &&
                subAction.selectionBehavior === selectionBehaviorCode &&
                subAction.action) {
                isMatch = isActionMatch(subAction.action);
            }
            if (!isMatch && subAction.action) {
                isMatch = findSelectionMatch(subAction.action);
            }
        }
        return isMatch;
    };
    const isActionMatch = (selectionGroupAction) => {
        let isMatch = false;
        const selectionGroupTitles = selectionGroupAction
            .map((subAction) => {
            return subAction.title;
        })
            .filter(helpers_1.notEmpty);
        isMatch =
            selectionGroupTitles.sort().toString() ===
                selectionActionIdentifiers.sort().toString();
        return isMatch;
    };
    let isMatch = false;
    if ((_a = this.cpgResponse) === null || _a === void 0 ? void 0 : _a.entry) {
        for (let i = 0; i < this.cpgResponse.entry.length && !isMatch; i++) {
            const resource = this.cpgResponse.entry[i]
                .resource;
            isMatch = resource.action ? findSelectionMatch(resource.action) : false;
        }
    }
    const message = (0, assert_1.default)(isMatch, 'Unable to find a matching selection group');
});
(0, cucumber_1.Then)('no activites should have been recommended', function () {
    var _a;
    (0, assert_1.default)((0, helpers_1.isEmpty)(this.recommendations), `Found recommendations:\n- ${(_a = this.recommendations) === null || _a === void 0 ? void 0 : _a.join('\n- ')}`);
});
(0, cucumber_1.After)(function (scenario) {
    var _a, _b;
    if (((_a = scenario === null || scenario === void 0 ? void 0 : scenario.result) === null || _a === void 0 ? void 0 : _a.status) === 'PASSED') {
        (0, assert_1.default)((0, helpers_1.isEmpty)(this.recommendations), `Found remaining recommendations:\n- ${(_b = this.recommendations) === null || _b === void 0 ? void 0 : _b.join('\n- ')}`);
    }
});
