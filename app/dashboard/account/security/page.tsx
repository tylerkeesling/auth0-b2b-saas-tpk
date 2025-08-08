import { redirect } from "next/navigation"

import { appClient } from "@/lib/auth0"
import { managementClient } from "@/lib/auth0-manage"
import { SUPPORTED_PROVIDERS } from "@/lib/mfa-policy"
import { PageHeader } from "@/components/page-header"

import { MFAEnrollmentForm } from "./mfa-enrollment-form"

export default async function Profile() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login?returnTo=/dashboard/account/security")
  }

  const userId = session?.user.sub

  const [factorsResponse, enrollmentsResponse, userMetadataResponse] =
    await Promise.all([
      managementClient.guardian.getFactors(),
      managementClient.users.getAuthenticationMethods({ id: userId }),
      managementClient.users.get({ id: userId, fields: "user_metadata" }),
    ])

  const factors = factorsResponse.data
  const enrollments = enrollmentsResponse.data
  const enforceMfa = userMetadataResponse.data.user_metadata?.enforce_mfa

  const filteredFactors = factors
    .filter((factor: any) => {
      let factorName: string = factor.name

      return SUPPORTED_PROVIDERS.includes(factorName) && factor.enabled
    })
    .map((factor: any) => {
      const enrollmentInfo = enrollments.find((enrollment: any) => {
        let factorName: string = factor.name

        if (factor.name === "push-notification") {
          factorName = "guardian"
        }

        if (factor.name === "sms" || factor.name === "voice") {
          factorName = "phone"
        }

        return enrollment.type.includes(factorName)
      })

      return {
        ...factor,
        enrollmentId: enrollmentInfo?.id,
      }
    })

  return (
    <div className="space-y-2">
      <PageHeader
        title="Multifactor Authentication"
        description="Manage your account's security factors."
      />

      <MFAEnrollmentForm enforceMfa={enforceMfa} factors={filteredFactors} />
    </div>
  )
}
