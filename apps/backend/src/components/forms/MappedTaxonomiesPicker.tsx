import { useQuery } from "@apollo/client";
import { taxonomiesQueryGQL } from "@culturemap/core";
import { useTranslation } from "react-i18next";
import { Box, Flex } from "@chakra-ui/react";

import { FieldSelectOption, FieldSelect } from "~/components/forms";
import { getMultilangValue } from "~/utils";

// t("settings.taxMapping.options.label.typeOfInstitution", "Type of Institution")
// t("settings.taxMapping.options.label.typeOfOrganisation", "Type of Organisation")
// t("settings.taxMapping.options.label.targetAudience", "Target Audience")
// t("settings.taxMapping.options.label.eventType", "Event type")
// t("settings.taxMapping.options.label.accessibility", "Accessibility Information Type")
const options = [
  "typeOfInstitution",
  "typeOfOrganisation",
  "targetAudience",
  "eventType",
  "accessibility",
];

export const MappedTaxonomiesPicker = ({ ...props }: { props: any }) => {
  const { t, i18n } = useTranslation();

  const { data } = useQuery(taxonomiesQueryGQL, {
    variables: {
      orderBy: {
        [`name_${i18n.language}`]: "asc",
      },
    },
  });

  if (!data?.taxonomies?.taxonomies) {
    return <></>;
  }

  const taxOptions: FieldSelectOption[] = data?.taxonomies?.taxonomies.map(
    (t: any) => ({
      value: `${t.id}`,
      label: getMultilangValue(t.name),
    })
  );

  return (
    <Box borderBottom="1px solid" borderColor="gray.300" pb="2">
      {options.map((o) => (
        <Flex
          key={`tax-${o}`}
          borderTop="1px solid"
          borderColor="gray.300"
          pt="2"
        >
          <Box w="25%" minW="200px">
            <b>{t(`settings.taxMapping.options.label.${o}`)}</b>
          </Box>
          <Box w="75%" maxW="400px">
            <FieldSelect
              isRequired={true}
              name={o}
              id={o}
              label={t("settings.taxMapping.taxonmies.label", "Taxonomies")}
              options={[
                {
                  label: t(
                    "settings.taxMapping.taxonmies.pleaseChoose",
                    "Please choose a taxonomy"
                  ),
                  value: "",
                },
                ...taxOptions,
              ]}
              settings={{
                defaultValue: (props as any)[o],
                hideLabel: true,
              }}
            />
          </Box>
        </Flex>
      ))}
    </Box>
  );
};
