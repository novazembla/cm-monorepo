import { useTranslation } from "react-i18next";
import { TwoColFieldRow, FieldInput, FieldRow } from ".";

export const LocationPicker = ({
  lat,
  lng,
  required,
  fieldNameLat = "lat",
  fieldNameLng = "lng",
}: {
  lat: number;
  lng: number;
  required: boolean;
  fieldNameLat: string;
  fieldNameLng: string;
}) => {
  const {t} = useTranslation();
  
  return <TwoColFieldRow>
    <FieldRow>
      <FieldInput
        name={fieldNameLat}
        id={fieldNameLat}
        type="text"
        label={t("form.geolocation.lat.label", "Latitude")}
        isRequired={required}
        settings={{
          defaultValue: lat,
        }}
      />
    </FieldRow>
    <FieldRow>
      <FieldInput
        name={fieldNameLng} 
        id={fieldNameLng}
        type="text"
        label={t("form.geolocation.lng.label", "Longitude")}
        isRequired={required}
        settings={{
          defaultValue: lng,
        }}
      />
    </FieldRow>
  </TwoColFieldRow>;
};
