pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    triggers {
        cron('0 2 * * *')   // nightly at 2am
    }

    environment {
        // Only non-secret config is pipeline-wide. Credentials are bound at the stage
        // level (Test / Performance) so the Checkout and Install stages — including
        // `npm ci`, which runs third-party install scripts — never see them.
        CI = 'true'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                // Use a workspace-local npm cache to avoid EACCES errors when
                // ~/.npm is root-owned from a previous sudo npm run on this machine
                sh 'npm ci --cache .npm-cache'
                sh 'npx playwright install --with-deps chromium'
            }
        }

        stage('Test') {
            // Credentials scoped to just this stage (Jenkins masks them in logs).
            environment {
                RSA_EMAIL      = credentials('RSA_EMAIL')
                RSA_PASSWORD   = credentials('RSA_PASSWORD')
                PROTO_USER     = credentials('PROTO_USER')
                PROTO_PASS     = credentials('PROTO_PASS')
                YAHOO_EMAIL    = credentials('YAHOO_EMAIL')
                YAHOO_PASSWORD = credentials('YAHOO_PASSWORD')
                GMAIL_EMAIL    = credentials('GMAIL_EMAIL')
                GMAIL_PASSWORD = credentials('GMAIL_PASSWORD')
            }
            steps {
                sh 'npm test'
            }
        }

        stage('Performance') {
            when {
                anyOf {
                    triggeredBy 'TimerTrigger'   // nightly cron
                    triggeredBy 'UserIdCause'    // manual run
                }
            }
            // The perf benchmark only drives the /client login → scope to RSA creds.
            environment {
                RSA_EMAIL    = credentials('RSA_EMAIL')
                RSA_PASSWORD = credentials('RSA_PASSWORD')
            }
            steps {
                sh 'npx playwright test tests/performance.spec.js --reporter=line'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'results/junit.xml'

            publishHTML([
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                reportName           : 'Playwright HTML Report'
            ])

            archiveArtifacts(
                artifacts        : 'test-results/**',
                allowEmptyArchive: true
            )
        }

        failure {
            // mail() requires an SMTP server configured in:
            // Manage Jenkins → System → E-mail Notification → SMTP server
            // Uncomment once SMTP is set up:
            // mail(
            //     to     : 'ankitomkara@gmail.com',
            //     subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //     body   : "Check: ${env.BUILD_URL}"
            // )
            echo "Build FAILED — ${env.BUILD_URL}"
        }

        success {
            echo "All tests passed on build #${env.BUILD_NUMBER}"
        }
    }
}