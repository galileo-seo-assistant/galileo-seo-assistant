import StringToDOM from "../string-to-dom";
import ScoreCalculator from "./score-calculator/score-calculator";

class SEOAssistant {

    constructor(DOM, elements) {

        if(typeof DOM === "string") {
            DOM = StringToDOM(DOM);
        }

        let priorities = ["error", "warning", "success"];
        let status = priorities[priorities.length - 1];
        let data = {
            tests: {
                passed_by: {
                    warning: []
                }
            },
            passed: [],
            passed_by: {
                error: [],
                warning: []
            },
            failed: [],
            failed_by: {
                error: [],
                warning: []
            },
            all: []
        };
        let score_weights = {error: 5, warning: 2};

        this.score = 0;
        this._data = data;
        this.status = status;

        elements.forEach(element => {
            let result = {name: element.name };
            let content = element.extract(DOM);
            result.extracted = {
                content,
                is_empty: content.length === 0,
                is_unique: content.length === 1
            };
            result.tests = [];

            element.tests.forEach(test => {
                let passed = test.expect(result.extracted.content);
                let resultTest = {
                    description: test.description,
                    level: test.level,
                    passed
                };
                result.tests.push(resultTest);

                if(passed) {
                    data.passed.push(test);
                    if(test.level === "error") {
                        data.passed_by.error.push(result);
                    } else if(test.level === "warning") {
                        data.tests.passed_by.warning.push(result);
                    }
                } else {
                    data.failed.push(test);
                    if(test.level === "error") {
                        data.failed_by.error.push(result);
                    } else if(test.level === "warning") {
                        data.failed_by.warning.push(result);
                    }
                }
                if(!passed && priorities.indexOf(test.level) !== priorities.length - 1) {
                    this.status = priorities.indexOf(test.level) < priorities.indexOf(this.status) ? test.level : this.status;
                }
                data.all.push(resultTest);
            });
        });

        let scores = {
            error: {
                weight: score_weights.error,
                total: data.failed_by.error.length + data.passed_by.error.length,
                partial: data.tests.passed_by.warning.length
            },
            warning: {
                weight: score_weights.warning,
                total: data.failed_by.warning.length + data.tests.passed_by.warning.length,
                partial: data.tests.passed_by.warning.length
            }
        };

        this.score = new ScoreCalculator(Object.values(scores)).score;
    }

    get all() {
        return this._data.all;
    }

    get passed () {
        return this._data.passed;
    }

    get failed_errors() {
        return this._data.failed_by.error;
    }

    get tests () {
        return this._data.tests;
    }

    get failed_warnings() {
        return this._data.failed_by.warning;
    }
}

export default SEOAssistant;