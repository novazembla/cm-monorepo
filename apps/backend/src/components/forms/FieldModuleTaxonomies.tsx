import { Divider, Box } from "@chakra-ui/react";
import { MultiLangValue } from "~/components/ui";
import { useTranslation } from "react-i18next";
import {
  FieldSelect,
  FieldRow,
  FieldRadioOrCheckboxGroup,
} from "~/components/forms";
import {
  getMultilangSortedList,
  getMultilangValue,
  mapTermDataToPrimaryTerm,
} from "~/utils";

export const FieldModuleTaxonomies = ({ data }: { data: any }) => {
  const { t } = useTranslation();

  if (!data || !data?.moduleTaxonomies) return <></>;

  return (
    <>
    <Divider mt="10" />
      {data?.moduleTaxonomies.map((taxonomy: any) => {
        let primaryTermId;
        if (taxonomy?.collectPrimaryTerm) {
          const primaryTerm = mapTermDataToPrimaryTerm(
            data?.location?.primaryTerms,
            taxonomy.terms
          );
          primaryTermId = primaryTerm?.id;
        }

        return (
          <Box
            key={`tax_${taxonomy.id}`}
            mt="6"
            _first={{
              mt: 0,
            }}
          >
            {taxonomy?.collectPrimaryTerm && (
              <FieldRow>
                <FieldSelect
                  id={`primary_tax_${taxonomy.id}`}
                  name={`primary_tax_${taxonomy.id}`}
                  label={`${getMultilangValue(taxonomy.name)} ${t(
                    "module.forms.taxonomy.label.primaryTerm",
                    "(primary term)"
                  )}`}
                  isRequired={false}
                  options={taxonomy.terms
                    .map((term: any) => ({
                      label: getMultilangValue(term.name),
                      value: term.id,
                    }))
                    .sort((a: any, b: any) => {
                      if (a.label < b.label) return -1;
                      if (b.label > a.label) return -1;
                      return 0;
                    })}
                  settings={{
                    defaultValue: primaryTermId,
                    placeholder: t(
                      "module.forms.taxonomy.label.choosePrimaryTerm",
                      "Please choose the primary term"
                    ),
                  }}
                />
              </FieldRow>
            )}
            <FieldRow>
              <FieldRadioOrCheckboxGroup
                id={`tax_${taxonomy.id}`}
                name={`tax_${taxonomy.id}`}
                isRequired={taxonomy?.isRequired}
                label={<MultiLangValue json={taxonomy.name} />}
                type="checkbox"
                options={getMultilangSortedList(
                  taxonomy.terms.map((term: any) => ({
                    label: term.name,
                    id: term.id,
                  })),
                  "label"
                )}
              />
            </FieldRow>
          </Box>
        );
      })}
    </>
  );
};
