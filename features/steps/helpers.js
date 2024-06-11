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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRequestResource = exports.createEndpoint = exports.notEmpty = exports.isEmpty = exports.removeFromSelectionGroups = exports.removeFromRecommendations = exports.resolveReference = exports.getInstantiatesCanonical = exports.is = void 0;
const fs_1 = __importDefault(require("fs"));
const requestResourceTypes = [
    'Task',
    'ServiceRequest',
    'CommunicationRequest',
    'MedicationRequest',
    'ImmunizationRecommendation',
    'RequestGroup',
];
exports.is = {
    CommunicationRequest: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'CommunicationRequest';
    },
    Bundle: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'Bundle';
    },
    ImmunizationRecommendation: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'ImmunizationRecommendation';
    },
    MedicationRequest: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'MedicationRequest';
    },
    PlanDefinition: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'PlanDefinition';
    },
    RequestResource: (resource) => {
        return exports.is.RequestResourceType(resource === null || resource === void 0 ? void 0 : resource.resourceType);
    },
    RequestResourceType: (resourceType) => {
        return (requestResourceTypes === null || requestResourceTypes === void 0 ? void 0 : requestResourceTypes.find((a) => a === resourceType)) != null;
    },
    ServiceRequest: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'ServiceRequest';
    },
    Task: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'Task';
    },
    RequestGroup: (resource) => {
        return (resource === null || resource === void 0 ? void 0 : resource.resourceType) === 'RequestGroup';
    },
};
/**
 * Return instantiates canonical reference from the request resource which points back to definition.
 *
 * Communication and Immunization use instantiates canonical extension.
 *
 * Other request resources use instantiatesCanonical which is an array. Expect there to be only 1 definition when calling $apply.
 *
 * @param resource Request Resource
 */
const getInstantiatesCanonical = (resource) => {
    var _a, _b, _c, _d;
    let canonical;
    if (exports.is.CommunicationRequest(resource) ||
        exports.is.ImmunizationRecommendation(resource)) {
        canonical =
            (_d = (_c = (_b = (_a = resource.extension) === null || _a === void 0 ? void 0 : _a.find((e) => (e.url =
                'http://hl7.org/fhir/StructureDefinition/workflow-instantiatesCanonical'))) === null || _b === void 0 ? void 0 : _b.valueCanonical) === null || _c === void 0 ? void 0 : _c.split('|')[0]) !== null && _d !== void 0 ? _d : undefined;
    }
    else if (resource.instantiatesCanonical &&
        resource.instantiatesCanonical.length) {
        canonical = resource.instantiatesCanonical[0].split('|')[0];
        resource.instantiatesCanonical.length > 1
            ? console.error(`Found more than one definition for request resource ${resource.resourceType}/${resource.id}: ${resource.instantiatesCanonical}.`)
            : null;
    }
    return canonical;
};
exports.getInstantiatesCanonical = getInstantiatesCanonical;
/**
 * Resolve resource from filesystem or rest endpoint
 *
 * @param id Id of resource to resolve
 * @param resourceType Type of resource to resolve
 * @param endpointAddress Address to use for search
 * @param version Optional version of resource
 */
const resolveReference = (id, resourceType, endpointAddress, version) => __awaiter(void 0, void 0, void 0, function* () {
    let resource;
    if (endpointAddress.startsWith('http')) {
        try {
            const versionQuery = version ? `&version=${version}` : null;
            const response = yield fetch(`${endpointAddress}/${resourceType}?_id=${id + versionQuery}`);
            if (!response.ok) {
                throw response;
            }
            const json = yield response.json();
            resource = json.entry[0].resource;
        }
        catch (e) {
            console.log(e);
        }
    }
    else if (endpointAddress.startsWith('file://')) {
        const fileName = `${resourceType}-${id}.json`;
        resource = JSON.parse(fs_1.default.readFileSync(`${endpointAddress.replace('file://', '')}/${fileName}`, {
            encoding: 'utf8',
        }));
    }
    return resource;
});
exports.resolveReference = resolveReference;
/**
 * Remove canonical reference from a list of request resource references. This enables checking for requests that have not yet been tested against. Each time a request matches an assertion, it is removed.
 *
 * @param identifier Canonical reference to remove
 * @param recommendations List of remaining request resource canonicals from the $apply output
 */
const removeFromRecommendations = (identifier, recommendations) => {
    recommendations = recommendations === null || recommendations === void 0 ? void 0 : recommendations.filter((c) => c !== identifier);
    return recommendations;
};
exports.removeFromRecommendations = removeFromRecommendations;
const removeFromSelectionGroups = (selectionBehaviorCode, identifiers, selectionGroups) => {
    selectionGroups = selectionGroups.filter(sg => {
        sg.selectionCode !== selectionBehaviorCode &&
            sg.definitions.sort().toString() !== identifiers.sort().toString();
    });
    return selectionGroups;
};
exports.removeFromSelectionGroups = removeFromSelectionGroups;
const isEmpty = (requests) => {
    return !requests || requests.length === 0;
};
exports.isEmpty = isEmpty;
const notEmpty = (value) => {
    return value !== null && value !== undefined;
};
exports.notEmpty = notEmpty;
const createEndpoint = (type, address) => {
    let endpointType;
    if (address.startsWith('file://')) {
        endpointType = 'hl7-fhir-file';
    }
    else if (address.startsWith('http')) {
        endpointType = 'hl7-fhir-rest';
    }
    else {
        throw new Error(`${type} endpoint must start with http or file`);
    }
    return {
        resourceType: 'Endpoint',
        address: address,
        status: 'active',
        payloadType: [
            {
                coding: [
                    {
                        code: type,
                    },
                ],
            },
        ],
        connectionType: {
            code: endpointType,
        },
    };
};
exports.createEndpoint = createEndpoint;
const resolveRequestResource = (action, bundle) => {
    var _a, _b, _c;
    if ((_a = action.resource) === null || _a === void 0 ? void 0 : _a.reference) {
        const id = action.resource.reference.split('/')[1];
        return (_c = (_b = bundle === null || bundle === void 0 ? void 0 : bundle.entry) === null || _b === void 0 ? void 0 : _b.find((e) => { var _a; return ((_a = e.resource) === null || _a === void 0 ? void 0 : _a.id) === id; })) === null || _c === void 0 ? void 0 : _c.resource;
    }
};
exports.resolveRequestResource = resolveRequestResource;
