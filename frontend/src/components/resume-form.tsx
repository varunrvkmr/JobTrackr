"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"

export default function ResumeForm() {
  // State for education fields
  const [educationFields, setEducationFields] = useState([
    { id: 1, institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" },
  ])

  // State for work experience fields
  const [workFields, setWorkFields] = useState([
    { id: 1, company: "", position: "", location: "", startDate: "", endDate: "", description: "" },
  ])

  // Add education field
  const addEducationField = () => {
    const newField = {
      id: educationFields.length + 1,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    setEducationFields([...educationFields, newField])
  }

  // Remove education field
  const removeEducationField = (id: number) => {
    if (educationFields.length > 1) {
      setEducationFields(educationFields.filter((field) => field.id !== id))
    }
  }

  // Add work experience field
  const addWorkField = () => {
    const newField = {
      id: workFields.length + 1,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    setWorkFields([...workFields, newField])
  }

  // Remove work experience field
  const removeWorkField = (id: number) => {
    if (workFields.length > 1) {
      setWorkFields(workFields.filter((field) => field.id !== id))
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    console.log("Form submitted")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Enter your first name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Enter your last name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="Enter your phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Enter your city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="Enter your state" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Experience */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education Experience</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEducationField}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" /> Add Education
            </Button>
          </div>

          {educationFields.map((field, index) => (
            <div key={field.id} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
              {index > 0 && (
                <div className="flex justify-end mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducationField(field.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`institution-${field.id}`}>Institution</Label>
                  <Input id={`institution-${field.id}`} placeholder="Enter institution name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`degree-${field.id}`}>Degree</Label>
                  <Input id={`degree-${field.id}`} placeholder="Enter degree" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`field-${field.id}`}>Field of Study</Label>
                  <Input id={`field-${field.id}`} placeholder="Enter field of study" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edu-start-${field.id}`}>Start Date</Label>
                    <Input id={`edu-start-${field.id}`} type="month" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`edu-end-${field.id}`}>End Date</Label>
                    <Input id={`edu-end-${field.id}`} type="month" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`edu-desc-${field.id}`}>Description</Label>
                  <Textarea id={`edu-desc-${field.id}`} placeholder="Describe your education" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Work Experience</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addWorkField}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" /> Add Experience
            </Button>
          </div>

          {workFields.map((field, index) => (
            <div key={field.id} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
              {index > 0 && (
                <div className="flex justify-end mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWorkField(field.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${field.id}`}>Company</Label>
                  <Input id={`company-${field.id}`} placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`position-${field.id}`}>Position</Label>
                  <Input id={`position-${field.id}`} placeholder="Enter position" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`work-location-${field.id}`}>Location</Label>
                  <Input id={`work-location-${field.id}`} placeholder="Enter work location" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`work-start-${field.id}`}>Start Date</Label>
                    <Input id={`work-start-${field.id}`} type="month" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`work-end-${field.id}`}>End Date</Label>
                    <Input id={`work-end-${field.id}`} type="month" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`work-desc-${field.id}`}>Description</Label>
                  <Textarea id={`work-desc-${field.id}`} placeholder="Describe your responsibilities" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (separate with commas)</Label>
            <Textarea id="skills" placeholder="Enter your skills" />
          </div>
        </CardContent>
      </Card>

      {/* Professional Profiles */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Professional Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" type="url" placeholder="Enter your LinkedIn profile URL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input id="github" type="url" placeholder="Enter your GitHub profile URL" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographic Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Demographic Information (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ethnicity">Race & Ethnicity</Label>
              <Select>
                <SelectTrigger id="ethnicity">
                  <SelectValue placeholder="Select race/ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="black">Black or African American</SelectItem>
                  <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                  <SelectItem value="native-american">Native American or Alaska Native</SelectItem>
                  <SelectItem value="pacific-islander">Native Hawaiian or Pacific Islander</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="two-or-more">Two or more races</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disability">Disability Status</Label>
              <Select>
                <SelectTrigger id="disability">
                  <SelectValue placeholder="Select disability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I have a disability</SelectItem>
                  <SelectItem value="no">No, I don't have a disability</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="veteran">Veteran Status</Label>
              <Select>
                <SelectTrigger id="veteran">
                  <SelectValue placeholder="Select veteran status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I am a veteran</SelectItem>
                  <SelectItem value="no">No, I am not a veteran</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Submit Information
        </Button>
      </div>
    </form>
  )
}

