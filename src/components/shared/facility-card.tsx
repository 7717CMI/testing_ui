import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Facility } from "@/types"
import { Building2, MapPin, Phone, Mail, Globe, Save, Newspaper, CheckCircle2 } from "lucide-react"

interface FacilityCardProps {
  facility: Facility
  onSave?: () => void
  onNewsClick?: () => void
}

export function FacilityCard({ facility, onSave, onNewsClick }: FacilityCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary-500" />
              <h3 className="font-semibold text-lg">{facility.name}</h3>
              {facility.verified && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default">{facility.type}</Badge>
              <Badge variant="outline">{facility.ownership}</Badge>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{facility.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{facility.address}</span>
          </div>
          {facility.bedCount > 0 && (
            <div className="text-muted-foreground">
              <span className="font-medium">{facility.bedCount}</span> beds
            </div>
          )}
          <p className="text-muted-foreground">{facility.summary}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {facility.accreditation.map((acc) => (
            <Badge key={acc} variant="secondary" className="text-xs">
              {acc}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`tel:${facility.phone}`)}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`mailto:${facility.email}`)}
          >
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => window.open(facility.website, "_blank")}
          >
            <Globe className="h-4 w-4 mr-1" />
            Website
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewsClick}
          >
            <Newspaper className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

